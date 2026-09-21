using backend_projeto.Models.DTOs;
using backend_proyecto.Config;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using System.Net;

public class PermissionServices
{
    private readonly ApplicationDbContext _context;
    private readonly CurrentTenantService _currentTenant;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ITenantRepository _tenantRepository;

    public PermissionServices(
        ApplicationDbContext context,
        CurrentTenantService currentTenant,
        IHttpContextAccessor httpContextAccessor,
        ITenantRepository tenantRepository)
    {
        _context = context;
        _currentTenant = currentTenant;
        _httpContextAccessor = httpContextAccessor;
        _tenantRepository = tenantRepository;
    }

    public async Task CheckPermission(
        string permissionName,
        int? tenantId = null)
    {
        var context = _httpContextAccessor.HttpContext;

        if (context == null)
        {
            throw new HttpResponseError(
                HttpStatusCode.Unauthorized,
                "No hay una request activa"
            );
        }

        var userIdClaim = context.User.FindFirst("id");

        if (userIdClaim == null)
        {
            throw new HttpResponseError(
                HttpStatusCode.Unauthorized,
                "Usuario no autenticado"
            );
        }

        if (!int.TryParse(userIdClaim.Value, out var userId))
        {
            throw new HttpResponseError(
                HttpStatusCode.Unauthorized,
                "Usuario no válido"
            );
        }

        tenantId ??= _currentTenant.TenantId;

        if (tenantId == null)
        {
            throw new HttpResponseError(
                HttpStatusCode.BadRequest,
                "No se especificó un negocio"
            );
        }

        var tenant = await _tenantRepository.GetOneAsync(t => t.Id == tenantId);
        if (tenant == null)
        {
            throw new HttpResponseError(
                HttpStatusCode.NotFound,
                "No existe el tenant o está inactivo"
            );
        }

        if (tenant.IsActive == false)
        {
            throw new HttpResponseError(
                HttpStatusCode.NotFound,
                "No existe el tenant o está inactivo"
            );
        }

        var permissions = await GetEffectivePermissions(
            userId,
            tenantId.Value
        );

        if (!permissions.Contains(permissionName))
        {
            throw new HttpResponseError(
                HttpStatusCode.Forbidden,
                "No tenés permiso para realizar esta acción"
            );
        }
    }

    public async Task CheckAdminPermission(
        string permissionName)
    {
        var context = _httpContextAccessor.HttpContext;

        if (context == null)
        {
            throw new HttpResponseError(
                HttpStatusCode.Unauthorized,
                "No hay una request activa"
            );
        }

        var userIdClaim = context.User.FindFirst("id");

        if (userIdClaim == null)
        {
            throw new HttpResponseError(
                HttpStatusCode.Unauthorized,
                "Usuario no autenticado"
            );
        }

        if (!int.TryParse(userIdClaim.Value, out var userId))
        {
            throw new HttpResponseError(
                HttpStatusCode.Unauthorized,
                "Usuario no válido"
            );
        }

        var isAdmin = await _context.Admin
            .AnyAsync(a => a.UserId == userId);

        if (!isAdmin)
        {
            throw new HttpResponseError(
                HttpStatusCode.Forbidden,
                "No tenés permisos de administrador"
            );
        }

        if (permissionName != Permissions.ADMIN_PAYMENTS)
        {
            throw new HttpResponseError(
                HttpStatusCode.Forbidden,
                "No tenés permiso para realizar esta acción"
            );
        }
    }

    public async Task<UserTenantPermissionsDTO> GetUserPermissionsInTenant(
        int userId,
        int tenantId)
    {
        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null)
        {
            throw new HttpResponseError(
                HttpStatusCode.NotFound,
                "No existe el negocio"
            );
        }

        var roles = new List<string>();

        var isTenant =
            tenant.OwnerUserId == userId;

        var isAdmin = await _context.Admin
            .AnyAsync(a => a.UserId == userId);

        var professor = await _context.Professors
            .FirstOrDefaultAsync(p =>
                p.UserId == userId &&
                p.TenantId == tenantId
            );

        var isStudent = await _context.Students
            .AnyAsync(s =>
                s.UserId == userId &&
                s.TenantId == tenantId
            );

        if (isAdmin)
            roles.Add(Roles.ADMIN);

        if (isTenant)
            roles.Add(Roles.TENANT);

        if (professor != null)
            roles.Add(Roles.PROFESSOR);

        if (isStudent)
            roles.Add(Roles.STUDENT);

        if (roles.Count == 0)
        {
            return new UserTenantPermissionsDTO
            {
                Roles = roles,
                Permissions = new List<string>(),
                HasAccessToTenant = false
            };
        }

        var permissions = await GetEffectivePermissions(
            userId,
            tenantId
        );

        return new UserTenantPermissionsDTO
        {
            Roles = roles,
            Permissions = permissions.ToList(),
            HasAccessToTenant = true
        };
    }

    private async Task<HashSet<string>> GetEffectivePermissions(
        int userId,
        int tenantId)
    {
        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null)
        {
            throw new HttpResponseError(
                HttpStatusCode.NotFound,
                "No existe el negocio"
            );
        }

        // El dueño del negocio tiene todos los permisos
        if (tenant.OwnerUserId == userId)
        {
            return await GetAllPermissions();
        }

        // Permisos obtenidos mediante grupos
        var groupPermissions = await _context.UserGroups
            .Where(ug =>
                ug.UserId == userId &&
                ug.Group.TenantId == tenantId
            )
            .SelectMany(ug =>
                ug.Group.GroupPermissions
                    .Select(gp => gp.Permission.Name)
            )
            .Distinct()
            .ToListAsync();

        var permissions = new HashSet<string>(
            groupPermissions
        );

        // Buscar si el usuario es profesor de este tenant
        var professor = await _context.Professors
            .FirstOrDefaultAsync(p =>
                p.UserId == userId &&
                p.TenantId == tenantId
            );

        // Aplicar overrides individuales del profesor
        if (professor != null)
        {
            var professorOverrides =
                await _context.ProfessorPermissions
                    .Where(pp =>
                        pp.ProfessorId == professor.Id
                    )
                    .Select(pp => new
                    {
                        PermissionName = pp.Permission.Name,
                        pp.IsAllowed
                    })
                    .ToListAsync();

            foreach (var overridePermission in professorOverrides)
            {
                if (overridePermission.IsAllowed)
                {
                    permissions.Add(
                        overridePermission.PermissionName
                    );
                }
                else
                {
                    permissions.Remove(
                        overridePermission.PermissionName
                    );
                }
            }
        }

        return permissions;
    }

    private async Task<HashSet<string>> GetAllPermissions()
    {
        var permissions = await _context.Permissions
            .Where(p => !p.Name.StartsWith("ADMIN_"))
            .Select(p => p.Name)
            .ToListAsync();

        return new HashSet<string>(permissions);
    }
}