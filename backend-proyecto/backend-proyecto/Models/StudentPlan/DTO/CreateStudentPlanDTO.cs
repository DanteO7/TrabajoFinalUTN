using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class CreateStudentPlanDTO
    {
        [Required]
        public int TenantId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = null!;

        [Required]
        public int ClassesPerMonth { get; set; }

        [Required]
        public decimal Price { get; set; }
    }
}
