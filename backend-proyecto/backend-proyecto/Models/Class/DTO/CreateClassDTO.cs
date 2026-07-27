using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class CreateClassDTO
    {
        [Required]
        public int ActivityId { get; set; }

        [Required]
        public int ProfessorId { get; set; }

        [Required]
        public int TenantId { get; set; }
        
        [Required]
        public DateOnly Date { get; set; }

        [Required]
        public TimeOnly StartTime { get; set; }

        [Required]
        public TimeOnly EndTime { get; set; }

        [Required]
        public int MaxCapacity { get; set; }
    }
}
