using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class UpdateTenantPlanDTO
    {
        [MaxLength(50)]
        public string? Name { get; set; } = null!;
        public decimal? Price { get; set; }
        public int? MaxStudents { get; set; }
        public int? MaxProfessors { get; set; }
        public bool? IncludesExercisesAndRoutines { get; set; }
    }
}
