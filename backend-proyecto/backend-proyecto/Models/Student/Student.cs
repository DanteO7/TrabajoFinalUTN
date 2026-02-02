using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend_proyecto.Enums;

namespace backend_proyecto.Models
{
    public class Student
    {
        [Key]
        [ForeignKey(nameof(User))]
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        [ForeignKey(nameof(Plan))]
        public int PlanId { get; set; }
        public Plan Plan { get; set; } = null!;

        [Required]
        public string MonthlyFeeStatus { get; set; } = null!;
    }
}
