using backend_proyecto.Models;

public class Group
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public List<UserGroup> UserGroups { get; set; } = null!;
    public List<GroupPermission> GroupPermissions { get; set; } = null!;
}