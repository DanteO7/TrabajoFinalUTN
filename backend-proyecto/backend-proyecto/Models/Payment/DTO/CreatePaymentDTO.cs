using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class CreatePaymentDTO
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int PlanId { get; set; }

        [Required]
        public string PlanType { get; set; } = null!;

        [Required]
        public int TenantId { get; set; }

        [Required]
        public DateTime PaymentDate { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public string PaymentMethod { get; set; } = null!;
    }
}
