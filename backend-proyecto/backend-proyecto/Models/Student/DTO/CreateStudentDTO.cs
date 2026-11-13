using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class CreateStudentDTO
    {
        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Surname { get; set; } = null!;

        [Required]
        public int TenantId { get; set; }

        [Required]
        public int StudentPlanId { get; set; }
    }
}
