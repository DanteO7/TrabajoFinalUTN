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

        public async Task<Group> CreateGroup(string name, int tenantId)
        {
            var tenantExists = await _context.Tenants.AnyAsync(t => t.Id == tenantId);
            if (!tenantExists)
                throw new HttpResponseError(HttpStatusCode.NotFound, "Tenant no encontrado");

            var exists = await _context.Groups
                .AnyAsync(g => g.Name == name && g.TenantId == tenantId);

            if (exists)
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"Ya existe un grupo con nombre '{name}'");

            var group = new Group
            {
                Name = name,
                TenantId = tenantId
            };

            _context.Groups.Add(group);
            await _context.SaveChangesAsync();

            return group;
        }

        public async Task CreateDefaultGroups(int tenantId, int ownerUserId)
        {
            var tenantExists = await _context.Tenants.AnyAsync(t => t.Id == tenantId);
            if (!tenantExists)
                throw new HttpResponseError(HttpStatusCode.NotFound, "Tenant no encontrado");

            var tenantGroup = await CreateGroup("TENANT", tenantId);
            var professorBasic = await CreateGroup("PROFESSOR_BASIC", tenantId);
            var professorAdvanced = await CreateGroup("PROFESSOR_ADVANCED", tenantId);
            var studentGroup = await CreateGroup("STUDENT", tenantId);

            await AssignPermissionsToGroup(tenantGroup.Id, new[]
            {
                Permissions.TENANT_READ,
                Permissions.TENANT_UPDATE,

                Permissions.USER_READ,
                Permissions.USER_CREATE,
                Permissions.USER_UPDATE,
                Permissions.USER_DELETE,

                Permissions.STUDENT_READ,
                Permissions.STUDENT_CREATE,
                Permissions.STUDENT_UPDATE,
                Permissions.STUDENT_DELETE,

                Permissions.PROFESSOR_READ,
                Permissions.PROFESSOR_CREATE,
                Permissions.PROFESSOR_UPDATE,
                Permissions.PROFESSOR_DELETE,
                Permissions.PROFESSOR_ASSIGN_SPECIALITY,
                Permissions.PROFESSOR_REMOVE_SPECIALITY,

                Permissions.ACTIVITY_READ,
                Permissions.ACTIVITY_CREATE,
                Permissions.ACTIVITY_UPDATE,
                Permissions.ACTIVITY_DELETE,

                Permissions.SPECIALITY_READ,
                Permissions.SPECIALITY_CREATE,
                Permissions.SPECIALITY_UPDATE,
                Permissions.SPECIALITY_DELETE,

                Permissions.CLASS_READ,
                Permissions.CLASS_CREATE,
                Permissions.CLASS_UPDATE,
                Permissions.CLASS_DELETE,

                Permissions.RESERVATION_READ,
                Permissions.RESERVATION_CREATE,
                Permissions.RESERVATION_DELETE,
                Permissions.RESERVATION_CHANGE_STATUS,

                Permissions.PAYMENT_READ,
                Permissions.PAYMENT_CREATE,
                Permissions.PAYMENT_UPDATE,
                Permissions.PAYMENT_DELETE,

                Permissions.GROUP_READ,
                Permissions.GROUP_CREATE,
                Permissions.GROUP_UPDATE,
                Permissions.GROUP_DELETE,
                Permissions.GROUP_ASSIGN_USER,
                Permissions.GROUP_REMOVE_USER,
                Permissions.GROUP_ASSIGN_PERMISSION
            });

            await AssignPermissionsToGroup(professorBasic.Id, new[]
            {
                Permissions.CLASS_READ,
                Permissions.RESERVATION_READ
            });

            await AssignPermissionsToGroup(professorAdvanced.Id, new[]
            {
                Permissions.CLASS_READ,
                Permissions.CLASS_CREATE,
                Permissions.CLASS_UPDATE,
                Permissions.RESERVATION_READ
            });

            await AssignPermissionsToGroup(studentGroup.Id, new[]
            {
                Permissions.RESERVATION_CREATE,
                Permissions.RESERVATION_READ,
                Permissions.PAYMENT_CREATE,
                Permissions.PAYMENT_READ
            });

            await AssignUserToGroup(ownerUserId, tenantGroup.Id);
        }

        public async Task AssignPermissionsToGroup(int groupId, string[] permissions)
        {
            var group = await _context.Groups
                .Include(g => g.GroupPermissions)
                .FirstOrDefaultAsync(g => g.Id == groupId);

            if (group == null)
                throw new HttpResponseError(HttpStatusCode.NotFound, "Grupo no encontrado");

            foreach (var permissionName in permissions)
            {
                var permission = await _context.Permissions
                    .FirstOrDefaultAsync(p => p.Name == permissionName);

                if (permission == null)
                    throw new HttpResponseError(HttpStatusCode.NotFound, $"Permiso '{permissionName}' no existe");

                var exists = group.GroupPermissions
                    .Any(gp => gp.PermissionId == permission.Id);

                if (!exists)
                {
                    group.GroupPermissions.Add(new GroupPermission
                    {
                        GroupId = groupId,
                        PermissionId = permission.Id
                    });
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task AssignUserToGroup(int userId, int groupId)
        {
            var group = await _context.Groups
                .FirstOrDefaultAsync(g => g.Id == groupId);

            if (group == null)
                throw new HttpResponseError(HttpStatusCode.NotFound, "Grupo no encontrado");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new HttpResponseError(HttpStatusCode.NotFound, "Usuario no encontrado");

            var exists = await _context.UserGroups
                .AnyAsync(ug => ug.UserId == userId && ug.GroupId == groupId);

            if (exists)
                throw new HttpResponseError(HttpStatusCode.BadRequest, "El usuario ya pertenece al grupo");

            _context.UserGroups.Add(new UserGroup
            {
                UserId = userId,
                GroupId = groupId
            });

            await _context.SaveChangesAsync();
        }

        public async Task RemoveUserFromGroup(int userId, int groupId)
        {
            var relation = await _context.UserGroups
                .FirstOrDefaultAsync(ug => ug.UserId == userId && ug.GroupId == groupId);

            if (relation == null)
                throw new HttpResponseError(HttpStatusCode.NotFound, "El usuario no pertenece al grupo");

            _context.UserGroups.Remove(relation);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Group>> GetGroupsByTenant(int tenantId)
        {
            var tenantExists = await _context.Tenants.AnyAsync(t => t.Id == tenantId);
            if (!tenantExists)
                throw new HttpResponseError(HttpStatusCode.NotFound, "Tenant no encontrado");

            return await _context.Groups
                .Where(g => g.TenantId == tenantId)
                .Include(g => g.GroupPermissions)
                .ThenInclude(gp => gp.Permission)
                .ToListAsync();
        }

        public async Task RemovePermissionFromGroup(int groupId, string permissionName)
        {
            var groupExists = await _context.Groups
                .AnyAsync(g => g.Id == groupId);

            if (!groupExists)
                throw new HttpResponseError(HttpStatusCode.NotFound, "Grupo no encontrado");

            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Name == permissionName);

            if (permission == null)
                throw new HttpResponseError(HttpStatusCode.NotFound, "Permiso no encontrado");

            var relation = await _context.Set<GroupPermission>()
                .FirstOrDefaultAsync(gp =>
                    gp.GroupId == groupId &&
                    gp.PermissionId == permission.Id);

            if (relation == null)
                throw new HttpResponseError(HttpStatusCode.BadRequest, "El grupo no tiene ese permiso");

            _context.Remove(relation);
            await _context.SaveChangesAsync();
        }
    }
}