namespace backend_proyecto.Models.DTOs
{
    public class ResponseTenantDTO
    {
        public int Id { get; set; }
        public int OwnerUserId { get; set; }
        public UserWithoutPassDTO OwnerUser { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Address { get; set; }
        public Dictionary<string, string>? SocialNetworks { get; set; }
        public bool IsActive { get; set; }
        public int TenantPlanId { get; set; }
        public string Role { get; set; } = null!;
        public ResponseTenantPlanDTO TenantPlan { get; set; } = null!;
        public string MonthlyFeeStatus { get; set; } = null!;
    }
}
