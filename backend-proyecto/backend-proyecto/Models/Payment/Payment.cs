using backend_proyecto.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_proyecto.Models
{
    public class Payment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [ForeignKey(nameof(StudentUser))]
        public int StudentUserId { get; set; }
        public User StudentUser { get; set; } = null!;

        [ForeignKey(nameof(Plan))]
        public int PlanId { get; set; }
        public Plan Plan { get; set; } = null!;

        public DateTime PaymentDate { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; } = null!;
    }
}
