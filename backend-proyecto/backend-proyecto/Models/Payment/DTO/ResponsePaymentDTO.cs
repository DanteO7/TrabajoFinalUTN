using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class ResponsePaymentDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public UserWithoutPassDTO User { get; set; } = null!;
        public int PlanId { get; set; }
        public string PlanType { get; set; } = null!;
        public int TenantId { get; set; }
        public DateTime PaymentDate { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = null!;
    }
}
