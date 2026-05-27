namespace backend_proyecto.Models
{
    public class Activity
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
    }
}