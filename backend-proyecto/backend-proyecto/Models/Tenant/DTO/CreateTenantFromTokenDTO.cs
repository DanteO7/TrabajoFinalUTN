namespace backend_proyecto.Models.DTOs
{
    public class CreateTenantFromTokenDTO
    {
        public string Token { get; set; } = null!; 
        public string Name { get; set; } = null!;
        public int TenantPlanId { get; set; }
    }
}
