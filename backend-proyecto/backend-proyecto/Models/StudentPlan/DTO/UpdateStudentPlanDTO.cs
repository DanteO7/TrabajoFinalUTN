using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class UpdateStudentPlanDTO
    {
        [MaxLength(50)]
        public string? Name { get; set; } = null!;
        public int? ClassesPerMonth { get; set; }
        public decimal? Price { get; set; }
    }
}
