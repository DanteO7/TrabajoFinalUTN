using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class ChangeStatusStudentDTO
    {
        [Required]
        public string MonthlyFeeStatus { get; set; } = null!;
    }
}
