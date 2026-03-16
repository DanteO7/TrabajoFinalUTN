using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class ResponseStudentPlanDTO
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string Name { get; set; } = null!;
        public int ClassesPerMonth { get; set; }
        public decimal Price { get; set; }
    }
}
