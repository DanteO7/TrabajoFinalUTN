using backend_proyecto.Config;
using backend_proyecto.Models;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using System.Net;

public class PermissionServices
{
    private readonly ApplicationDbContext _context;
    private readonly CurrentTenantService _currentTenant;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public PermissionServices(
        ApplicationDbContext context,
        CurrentTenantService currentTenant,
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _currentTenant = currentTenant;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task CheckPermission(string permissionName, int? tenantId = null)
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

        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId.Value);

        if (tenant == null)
        {
            throw new HttpResponseError(
                HttpStatusCode.NotFound,
                "No existe el negocio"
            );
        }

        // el dueño tiene todos los permisos
        if (tenant.OwnerUserId == userId)
            return;

        var hasPermission = await _context.UserGroups
            .AnyAsync(ug =>
                ug.UserId == userId &&
                ug.Group.TenantId == tenantId.Value &&
                ug.Group.GroupPermissions.Any(gp =>
                    gp.Permission.Name == permissionName
                )
            );

        if (!hasPermission)
        {
            throw new HttpResponseError(
                HttpStatusCode.Forbidden,
                "No tenés permiso para realizar esta acción"
            );
        }
    }
}