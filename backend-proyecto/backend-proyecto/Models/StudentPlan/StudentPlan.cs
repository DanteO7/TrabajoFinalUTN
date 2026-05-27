namespace backend_proyecto.Models
{
    public class StudentPlan
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
        public string Name { get; set; } = null!;
        public int ClassesPerMonth { get; set; }
        public decimal Price { get; set; }
    }
}