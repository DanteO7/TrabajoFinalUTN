using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class AssignStudentDTO
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int TenantId { get; set; }
        
        [Required]
        public int StudentPlanId { get; set; }

    }
}
