using backend_proyecto.Config;
using Microsoft.EntityFrameworkCore;

public class PermissionService
{
    private readonly ApplicationDbContext _context;

    public PermissionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> HasPermission(int userId, int tenantId, string permissionName)
    {
        return await _context.UserGroups
            .AsNoTracking()
            .Where(ug => ug.UserId == userId && ug.Group.TenantId == tenantId)
            .SelectMany(ug => ug.Group.GroupPermissions)
            .AnyAsync(gp => gp.Permission.Name == permissionName);
    }
}