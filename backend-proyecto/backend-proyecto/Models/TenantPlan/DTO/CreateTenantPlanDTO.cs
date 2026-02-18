using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class CreateTenantPlanDTO
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = null!;

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int MaxStudents { get; set; }

        [Required]
        public int MaxProfessors { get; set; }
    }
}
