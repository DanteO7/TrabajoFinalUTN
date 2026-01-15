using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend_proyecto.Enums;

namespace backend_proyecto.Models
{
    public class Student
    {
        [Key]
        [ForeignKey(nameof(User))]
        public int IdUser { get; set; }
        public User User { get; set; } = null!;

        [ForeignKey(nameof(Plan))]
        public int IdPlan { get; set; }
        public Plan Plan { get; set; } = null!;

        [Required]
        public MonthlyFeeStatus MonthlyFeeStatus { get; set; } = null!;
    }
}
