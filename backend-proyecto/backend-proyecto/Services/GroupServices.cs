using backend_proyecto.Config;
using backend_proyecto.Models;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace backend_proyecto.Services
{
    public class GroupServices
    {
        private readonly ApplicationDbContext _context;

        public GroupServices(ApplicationDbContext context)
        {
            _context = context;
        }

        // CREAR GRUPOS PREDEFINIDOS
        public async Task CreateDefaultGroups(int tenantId)
        {
            var tenantExists = await _context.Tenants
                .AnyAsync(t => t.Id == tenantId);

            if (!tenantExists)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "Tenant no encontrado"
                );
            }

            var student = await CreateGroupIfNotExists(
                "STUDENT",
                tenantId
            );

            var basicProfessor = await CreateGroupIfNotExists(
                "BASIC_PROFESSOR",
                tenantId
            );

            var advancedProfessor = await CreateGroupIfNotExists(
                "ADVANCED_PROFESSOR",
                tenantId
            );

            // STUDENT
            await AssignPermissionsToGroup(
                student.Id,
                new[]
                {
            Permissions.TENANT_READ,
            Permissions.NEWS_READ,
            Permissions.CLASS_READ,
            Permissions.PROFESSOR_READ,
            Permissions.ACTIVITY_READ,
            Permissions.RESERVATION_READ,
            Permissions.RESERVATION_CREATE,
            Permissions.RESERVATION_DELETE,
            Permissions.STUDENT_PLAN_READ,
            Permissions.PAYMENT_READ,
            Permissions.EXERCISE_READ,
            Permissions.ROUTINE_READ,
                }
            );

            // BASIC PROFESSOR
            await AssignPermissionsToGroup(
                basicProfessor.Id,
                new[]
                {            
            Permissions.TENANT_READ,
            Permissions.NEWS_READ,
            Permissions.CLASS_READ,
            Permissions.PROFESSOR_READ,
            Permissions.ACTIVITY_READ,
            Permissions.SPECIALITY_READ,
            Permissions.STUDENT_READ,
            Permissions.RESERVATION_READ,
            Permissions.PAYMENT_READ,
            Permissions.STUDENT_PLAN_READ,
            Permissions.EXERCISE_READ,
            Permissions.ROUTINE_READ,
                }
            );

            // ADVANCED PROFESSOR
            await AssignPermissionsToGroup(
                advancedProfessor.Id,
                new[]
                {
            Permissions.TENANT_READ,

            // STUDENTS
            Permissions.STUDENT_READ,
            Permissions.STUDENT_CREATE,
            Permissions.STUDENT_UPDATE,
            Permissions.STUDENT_DELETE,

            // PROFESSORS
            Permissions.PROFESSOR_READ,

            // ACTIVITIES
            Permissions.ACTIVITY_READ,
            Permissions.ACTIVITY_CREATE,
            Permissions.ACTIVITY_UPDATE,
            Permissions.ACTIVITY_DELETE,

            // SPECIALITIES
            Permissions.SPECIALITY_READ,
            Permissions.SPECIALITY_CREATE,
            Permissions.SPECIALITY_UPDATE,
            Permissions.SPECIALITY_DELETE,

            // CLASSES
            Permissions.CLASS_READ,
            Permissions.CLASS_CREATE,
            Permissions.CLASS_UPDATE,
            Permissions.CLASS_DELETE,

            // RESERVATIONS
            Permissions.RESERVATION_READ,
            Permissions.RESERVATION_CREATE,
            Permissions.RESERVATION_DELETE,
            Permissions.RESERVATION_CHANGE_STATUS,

            // PAYMENTS
            Permissions.PAYMENT_READ,
            Permissions.PAYMENT_CREATE,
            Permissions.PAYMENT_UPDATE,
            Permissions.PAYMENT_DELETE,

            // STUDENT PLANS
            Permissions.STUDENT_PLAN_READ,
            Permissions.STUDENT_PLAN_CREATE,
            Permissions.STUDENT_PLAN_UPDATE,
            Permissions.STUDENT_PLAN_DELETE,

            // NEWS
            Permissions.NEWS_READ,
            Permissions.NEWS_CREATE,
            Permissions.NEWS_UPDATE,
            Permissions.NEWS_DELETE,

            // EXERCISES
            Permissions.EXERCISE_READ,
            Permissions.EXERCISE_CREATE,
            Permissions.EXERCISE_UPDATE,
            Permissions.EXERCISE_DELETE,

            // ROUTINES
            Permissions.ROUTINE_READ,
            Permissions.ROUTINE_CREATE,
            Permissions.ROUTINE_UPDATE,
            Permissions.ROUTINE_DELETE,

            // GROUPS
            Permissions.GROUP_READ,
            
            // INVITATIONS
            Permissions.INVITATION_READ,
            Permissions.INVITATION_CREATE,
            Permissions.INVITATION_DELETE,
                }
            );
        }

        public async Task CreateDefaultGroupsForAllTenants()
        {
            var tenantIds = await _context.Tenants
                .Select(t => t.Id)
                .ToListAsync();

            Console.WriteLine($"TENANTS ENCONTRADOS: {tenantIds.Count}");

            foreach (var tenantId in tenantIds)
            {
                Console.WriteLine($"ACTUALIZANDO TENANT: {tenantId}");

                await CreateDefaultGroups(tenantId);
            }
        }

        private async Task<Group> CreateGroupIfNotExists(
            string name,
            int tenantId)
        {
            Console.WriteLine($"BUSCANDO {name} - TENANT {tenantId}");

            var group = await _context.Groups
                .Include(g => g.GroupPermissions)
                .FirstOrDefaultAsync(g =>
                    g.Name == name &&
                    g.TenantId == tenantId
                );

            Console.WriteLine(
                $"RESULTADO {name}: {(group == null ? "NO EXISTE" : $"EXISTE ID={group.Id}")}"
            );

            if (group != null)
                return group;

            Console.WriteLine($"CREANDO {name}");

            group = new Group
            {
                Name = name,
                TenantId = tenantId
            };

            _context.Groups.Add(group);
            await _context.SaveChangesAsync();

            Console.WriteLine($"CREADO {name} ID={group.Id}");

            return group;
        }

        // PERMISOS DEL GRUPO
        public async Task AssignPermissionsToGroup(
            int groupId,
            string[] permissions)
        {
            var group = await _context.Groups
                .Include(g => g.GroupPermissions)
                .FirstOrDefaultAsync(g => g.Id == groupId);

            if (group == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "Grupo no encontrado"
                );
            }

            var permissionIds = await _context.Permissions
                .Where(p => permissions.Contains(p.Name))
                .Select(p => p.Id)
                .ToListAsync();

            // Verificar que todos los permisos existan
            if (permissionIds.Count != permissions.Length)
            {
                var existingPermissionNames = await _context.Permissions
                    .Where(p => permissions.Contains(p.Name))
                    .Select(p => p.Name)
                    .ToListAsync();

                var missingPermissions = permissions
                    .Except(existingPermissionNames)
                    .ToList();

                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"Los siguientes permisos no existen: {string.Join(", ", missingPermissions)}"
                );
            }

            // Eliminar permisos que ya no deberían pertenecer al grupo
            var permissionsToRemove = group.GroupPermissions
                .Where(gp => !permissionIds.Contains(gp.PermissionId))
                .ToList();

            foreach (var groupPermission in permissionsToRemove)
            {
                group.GroupPermissions.Remove(groupPermission);
            }

            // Agregar permisos que faltan
            var existingPermissionIds = group.GroupPermissions
                .Select(gp => gp.PermissionId)
                .ToHashSet();

            foreach (var permissionId in permissionIds)
            {
                if (!existingPermissionIds.Contains(permissionId))
                {
                    group.GroupPermissions.Add(
                        new GroupPermission
                        {
                            GroupId = groupId,
                            PermissionId = permissionId
                        }
                    );
                }
            }

            await _context.SaveChangesAsync();
        }

        // REMOVER USUARIO DE GRUPO
        public async Task RemoveUserFromGroup(
            int userId,
            int groupId)
        {
            var relation = await _context.UserGroups
                .FirstOrDefaultAsync(ug =>
                    ug.UserId == userId &&
                    ug.GroupId == groupId
                );

            if (relation == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "El usuario no pertenece al grupo"
                );
            }

            _context.UserGroups.Remove(relation);

            await _context.SaveChangesAsync();
        }

        // OBTENER GRUPOS DEL TENANT
        public async Task<List<Group>> GetGroupsByTenant(
            int tenantId)
        {
            var tenantExists = await _context.Tenants
                .AnyAsync(t => t.Id == tenantId);

            if (!tenantExists)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "Tenant no encontrado"
                );
            }

            return await _context.Groups
                .Where(g => g.TenantId == tenantId)
                .Include(g => g.GroupPermissions)
                    .ThenInclude(gp => gp.Permission)
                .ToListAsync();
        }

        // REMOVER PERMISO DE GRUPO
        public async Task RemovePermissionFromGroup(
            int groupId,
            string permissionName)
        {
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p =>
                    p.Name == permissionName
                );

            if (permission == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "Permiso no encontrado"
                );
            }

            var relation = await _context.GroupPermissions
                .FirstOrDefaultAsync(gp =>
                    gp.GroupId == groupId &&
                    gp.PermissionId == permission.Id
                );

            if (relation == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El grupo no tiene ese permiso"
                );
            }

            _context.GroupPermissions.Remove(relation);

            await _context.SaveChangesAsync();
        }

        public async Task AssignUserToGroupIfNotExists(
            int userId,
            int tenantId,
            string groupName)
        {
            var group = await _context.Groups
                .FirstOrDefaultAsync(g =>
                    g.TenantId == tenantId &&
                    g.Name == groupName
                );

            if (group == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No existe el grupo '{groupName}' para este tenant"
                );
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "Usuario no encontrado"
                );
            }

            var exists = await _context.UserGroups
                .AnyAsync(ug =>
                    ug.UserId == userId &&
                    ug.GroupId == group.Id
                );

            if (exists)
                return;

            _context.UserGroups.Add(new UserGroup
            {
                UserId = userId,
                GroupId = group.Id
            });

            await _context.SaveChangesAsync();
        }
        public async Task AssignDefaultGroupsToExistingUsers()
        {
            Console.WriteLine(
                "========== ASIGNANDO GRUPOS A USUARIOS EXISTENTES =========="
            );

            var students = await _context.Students
                .ToListAsync();

            foreach (var student in students)
            {
                await AssignUserToGroupIfNotExists(
                    student.UserId,
                    student.TenantId,
                    "STUDENT"
                );

                Console.WriteLine(
                    $"Student UserId={student.UserId} → STUDENT Tenant={student.TenantId}"
                );
            }

            var professors = await _context.Professors
                .ToListAsync();

            foreach (var professor in professors)
            {
                // Verificar si es dueño del tenant
                var tenant = await _context.Tenants
                    .FirstOrDefaultAsync(t =>
                        t.Id == professor.TenantId
                    );

                if (tenant == null)
                    continue;

                var groupName =
                    tenant.OwnerUserId == professor.UserId
                        ? "ADVANCED_PROFESSOR"
                        : "BASIC_PROFESSOR";

                await AssignUserToGroupIfNotExists(
                    professor.UserId,
                    professor.TenantId,
                    groupName
                );

                Console.WriteLine(
                    $"Professor UserId={professor.UserId} → {groupName} Tenant={professor.TenantId}"
                );
            }

            Console.WriteLine(
                "========== FINALIZÓ ASIGNACIÓN DE GRUPOS =========="
            );
        }
    }
}