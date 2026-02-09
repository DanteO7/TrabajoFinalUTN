
namespace backend_proyecto.Models
{
    public interface Plan
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }

        public int? MaxStudents { get; set; }
        public int? MaxProfessors { get; set; }

        public int? TenantId { get; set; }
        public Tenant? Tenant { get; set; } 
        public int? ClassesPerMonth { get; set; }
    }
}
