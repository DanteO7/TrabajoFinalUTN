namespace backend_proyecto.Models
{
    public class Tenant
    {
        public int Id { get; set; }
        public int OwnerUserId { get; set; }
        public User OwnerUser { get; set; } = null!;
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; }
        public int TenantPlanId { get; set; }
        public TenantPlan TenantPlan { get; set; } = null!;
        public string MonthlyFeeStatus { get; set; } = null!;
    }
}