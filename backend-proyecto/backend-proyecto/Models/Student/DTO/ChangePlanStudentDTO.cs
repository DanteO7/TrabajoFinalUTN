using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class ChangePlanStudentDTO
    {
        [Required]
        public int StudentPlanId { get; set; }
    }
}
