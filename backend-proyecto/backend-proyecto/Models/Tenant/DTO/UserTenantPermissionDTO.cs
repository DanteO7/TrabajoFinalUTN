namespace backend_projeto.Models.DTOs
{
    public class UserTenantPermissionsDTO
    {
        public List<string> Roles { get; set; } = new();
        public List<string> Permissions { get; set; } = new();
        public bool HasAccessToTenant { get; set; }
    }
}