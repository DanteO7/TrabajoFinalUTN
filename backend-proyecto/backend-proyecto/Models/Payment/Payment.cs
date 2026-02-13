using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_proyecto.Models
{
    public class Payment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int PlanId { get; set; }
        public string PlanType { get; set; } = null!;

        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;

        public DateTime PaymentDate { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public string PaymentMethod { get; set; } = null!;
    }
}
