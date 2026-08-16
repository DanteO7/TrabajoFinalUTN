using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class UpdateStudentDTO
    {
        [Required]
        public int StudentPlanId { get; set; }

        [Required]
        public string MonthlyFeeStatus { get; set; } = null!;
    }
}
