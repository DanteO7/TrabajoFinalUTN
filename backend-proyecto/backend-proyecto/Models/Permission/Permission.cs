public class Permission
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public List<GroupPermission> GroupPermissions { get; set; } = null!;
}