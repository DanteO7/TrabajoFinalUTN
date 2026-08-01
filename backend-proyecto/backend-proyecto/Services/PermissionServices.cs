using backend_proyecto.Config;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using System.Net;

public class PermissionServices
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantRepository _tenantRepository;

    public PermissionServices(ApplicationDbContext context, ITenantRepository tenantRepository)
    {
        _context = context;
        _tenantRepository = tenantRepository;
    }

    public async Task<bool> HasPermission(int userId, int tenantId, string permissionName)
    {
        var isTenantOwner = await _tenantRepository.ExistsByOwnerAndId(userId, tenantId);
        if (isTenantOwner)
            return true;

        var hasPermission = await _context.UserGroups
            .Where(ug => ug.UserId == userId)
            .Include(ug => ug.Group)
                .ThenInclude(g => g.GroupPermissions)
                    .ThenInclude(gp => gp.Permission)
            .Where(ug => ug.Group.TenantId == tenantId)
            .AnyAsync(ug => ug.Group.GroupPermissions
                .Any(gp => gp.Permission.Name == permissionName));

        return hasPermission;
    }

    public async Task CheckPermission(int userId, int tenantId, string permissionName)
    {
        var hasPermission = await HasPermission(userId, tenantId, permissionName);

        if (!hasPermission)
        {
            throw new HttpResponseError(HttpStatusCode.Forbidden,
                $"No tenés permiso para realizar esta acción");
        }
    }
}