using backend_proyecto.Config;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace backend_proyecto.Services
{
    public class ProfessorPermissionServices
    {
        private readonly ApplicationDbContext _context;
        private readonly CurrentTenantService _currentTenantService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ProfessorPermissionServices(
            ApplicationDbContext context,
            CurrentTenantService currentTenantService,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _currentTenantService = currentTenantService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<List<ProfessorPermissionSettingDTO>> GetPermissionSettings(
            int professorId)
        {
            var (tenantId, professor, tenant) = await GetAuthorizedProfessor(professorId);

            var inheritedPermissions = await _context.UserGroups
                .Where(ug =>
                    ug.UserId == professor.UserId &&
                    ug.Group.TenantId == tenantId
                )
                .SelectMany(ug => ug.Group.GroupPermissions)
                .Select(gp => gp.Permission.Name)
                .Where(name => !name.StartsWith("ADMIN_"))
                .Distinct()
                .ToListAsync();

            var applicablePermissions = await _context.GroupPermissions
                .Where(gp =>
                    gp.Group.TenantId == tenantId &&
                    (gp.Group.Name == "BASIC_PROFESSOR" ||
                     gp.Group.Name == "ADVANCED_PROFESSOR")
                )
                .Select(gp => gp.Permission.Name)
                .Where(name => !name.StartsWith("ADMIN_"))
                .Distinct()
                .ToListAsync();
            applicablePermissions = applicablePermissions
                .Append(Permissions.TENANT_READ)
                .Distinct(StringComparer.Ordinal)
                .OrderBy(name => name)
                .ToList();

            var overrides = await _context.ProfessorPermissions
                .Where(pp => pp.ProfessorId == professorId)
                .Select(pp => new { pp.Permission.Name, pp.IsAllowed })
                .ToDictionaryAsync(pp => pp.Name, pp => pp.IsAllowed);

            if (professor.UserId == tenant.OwnerUserId)
            {
                return applicablePermissions
                    .Select(name => new ProfessorPermissionSettingDTO
                    {
                        Name = name,
                        IsAllowed = true,
                        IsInherited = true,
                        IsOverridden = false
                    })
                    .ToList();
            }

            var inheritedSet = inheritedPermissions.ToHashSet();

            return applicablePermissions
                .Select(name =>
                {
                    var isInherited = inheritedSet.Contains(name);
                    var isOverridden = overrides.TryGetValue(name, out var isAllowed);
                    var isTenantRead = name == Permissions.TENANT_READ;

                    return new ProfessorPermissionSettingDTO
                    {
                        Name = name,
                        IsInherited = isTenantRead || isInherited,
                        IsOverridden = !isTenantRead && isOverridden,
                        IsAllowed = isTenantRead || (isOverridden ? isAllowed : isInherited)
                    };
                })
                .ToList();
        }

        public async Task UpdatePermissionSettings(
            int professorId,
            UpdateProfessorPermissionsDTO update)
        {
            var (tenantId, professor, tenant) = await GetAuthorizedProfessor(professorId);

            if (update?.Permissions == null ||
                update.Permissions.Any(permission => permission == null))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Debés indicar los permisos que querés actualizar."
                );
            }

            if (professor.UserId == tenant.OwnerUserId)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "No se pueden modificar los permisos del dueño del negocio."
                );
            }

            var submittedNames = update.Permissions
                .Select(permission => permission.Name)
                .ToList();

            if (update.Permissions.Any(permission =>
                    permission.Name == Permissions.TENANT_READ &&
                    !permission.IsAllowed))
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "El permiso para consultar el negocio es obligatorio y no se puede desactivar."
                );
            }

            if (submittedNames.Any(string.IsNullOrWhiteSpace) ||
                submittedNames.Distinct(StringComparer.Ordinal).Count() != submittedNames.Count)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La lista de permisos contiene nombres vacíos o duplicados."
                );
            }

            var applicableNames = await GetApplicablePermissionNames(tenantId);

            var invalidNames = submittedNames
                .Except(applicableNames, StringComparer.Ordinal)
                .ToList();

            if (invalidNames.Count > 0)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    $"Permisos no aplicables al profesor: {string.Join(", ", invalidNames)}"
                );
            }

            var permissionIds = await _context.Permissions
                .Where(permission => submittedNames.Contains(permission.Name))
                .ToDictionaryAsync(permission => permission.Name, permission => permission.Id);

            var inheritedNames = await _context.UserGroups
                .Where(ug =>
                    ug.UserId == professor.UserId &&
                    ug.Group.TenantId == tenantId
                )
                .SelectMany(ug => ug.Group.GroupPermissions)
                .Select(gp => gp.Permission.Name)
                .Distinct()
                .ToListAsync();
            var inheritedSet = inheritedNames.ToHashSet(StringComparer.Ordinal);

            var existingOverrides = await _context.ProfessorPermissions
                .Where(pp =>
                    pp.ProfessorId == professorId &&
                    permissionIds.Values.Contains(pp.PermissionId)
                )
                .ToDictionaryAsync(pp => pp.PermissionId);

            foreach (var requested in update.Permissions)
            {
                var permissionId = permissionIds[requested.Name];
                var hasOverride = existingOverrides.TryGetValue(permissionId, out var existing);
                var inherited = inheritedSet.Contains(requested.Name);

                if (requested.IsAllowed == inherited)
                {
                    if (hasOverride)
                    {
                        _context.ProfessorPermissions.Remove(existing!);
                    }
                    continue;
                }

                if (hasOverride)
                {
                    existing!.IsAllowed = requested.IsAllowed;
                }
                else
                {
                    _context.ProfessorPermissions.Add(new ProfessorPermission
                    {
                        ProfessorId = professorId,
                        PermissionId = permissionId,
                        IsAllowed = requested.IsAllowed
                    });
                }
            }

            await _context.SaveChangesAsync();
        }

        private async Task<List<string>> GetApplicablePermissionNames(int tenantId)
        {
            var professorGroupPermissions = _context.GroupPermissions
                .Where(gp =>
                    gp.Group.TenantId == tenantId &&
                    (gp.Group.Name == "BASIC_PROFESSOR" ||
                     gp.Group.Name == "ADVANCED_PROFESSOR")
                )
                .Select(gp => gp.Permission.Name);

            var permissions = await professorGroupPermissions
                .Where(name => !name.StartsWith("ADMIN_"))
                .ToListAsync();

            return permissions
                .Append(Permissions.TENANT_READ)
                .Distinct(StringComparer.Ordinal)
                .ToList();
        }

        private async Task<(int TenantId, Professor Professor, Tenant Tenant)> GetAuthorizedProfessor(
            int professorId)
        {
            var tenantId = _currentTenantService.GetRequiredTenantId();
            var userIdValue = _httpContextAccessor.HttpContext?.User.FindFirst("id")?.Value;
            if (!int.TryParse(userIdValue, out var userId))
            {
                throw new HttpResponseError(
                    HttpStatusCode.Unauthorized,
                    "No se pudo identificar al usuario."
                );
            }

            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, "No existe el negocio.");
            }

            if (tenant.OwnerUserId != userId)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "Solo el dueño del negocio puede administrar los permisos de profesores."
                );
            }

            var professor = await _context.Professors
                .FirstOrDefaultAsync(p =>
                    p.Id == professorId &&
                    p.TenantId == tenantId
                );
            if (professor == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, "Profesor no encontrado en este negocio.");
            }

            return (tenantId, professor, tenant);
        }

        public async Task SetPermission(
            int professorId,
            string permissionName,
            bool isAllowed)
        {
            var professor = await _context.Professors
                .FirstOrDefaultAsync(p =>
                    p.Id == professorId
                );

            if (professor == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "Profesor no encontrado"
                );
            }

            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p =>
                    p.Name == permissionName
                );

            if (permission == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"Permiso '{permissionName}' no existe"
                );
            }

            var existing = await _context.ProfessorPermissions
                .FirstOrDefaultAsync(pp =>
                    pp.ProfessorId == professorId &&
                    pp.PermissionId == permission.Id
                );

            if (existing == null)
            {
                _context.ProfessorPermissions.Add(
                    new ProfessorPermission
                    {
                        ProfessorId = professorId,
                        PermissionId = permission.Id,
                        IsAllowed = isAllowed
                    }
                );
            }
            else
            {
                existing.IsAllowed = isAllowed;
            }

            await _context.SaveChangesAsync();
        }

        public async Task RemoveOverride(
            int professorId,
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

            var overridePermission =
                await _context.ProfessorPermissions
                    .FirstOrDefaultAsync(pp =>
                        pp.ProfessorId == professorId &&
                        pp.PermissionId == permission.Id
                    );

            if (overridePermission == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "El profesor no tiene un permiso personalizado"
                );
            }

            _context.ProfessorPermissions.Remove(
                overridePermission
            );

            await _context.SaveChangesAsync();
        }
    }
}