namespace backend_projeto.Models.DTOs
{
    public class UserTenantRolesDTO
    {
        public List<string> Roles { get; set; } = new List<string>();
        public bool HasAccessToTenant { get; set; }
    }
}