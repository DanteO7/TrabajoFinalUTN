namespace backend_proyecto.Models
{
    public class Tenant
    {
        public int Id { get; set; }
        public int OwnerUserId { get; set; }
        public User OwnerUser { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Address { get; set; }
        public Dictionary<string, string>? SocialNetworks { get; set; } = new();
        public bool IsActive { get; set; }
        public int TenantPlanId { get; set; }
        public TenantPlan TenantPlan { get; set; } = null!;
        public string MonthlyFeeStatus { get; set; } = null!;
        public DateTime? MonthlyFeeStatusUpdatedAt { get; set; }
        public ICollection<Professor> Professors { get; set; } = new List<Professor>();
        public ICollection<Student> Students { get; set; } = new List<Student>();
    }
}