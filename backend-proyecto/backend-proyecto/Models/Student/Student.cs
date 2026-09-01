namespace backend_proyecto.Models
{
    public class Student
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
        public int StudentPlanId { get; set; }
        public StudentPlan StudentPlan { get; set; } = null!;
        public string MonthlyFeeStatus { get; set; } = null!;
        public DateTime? MonthlyFeeStatusUpdatedAt { get; set; }
        public ICollection<Waitlist> Waitlists { get; set; } = new List<Waitlist>();
    }
}