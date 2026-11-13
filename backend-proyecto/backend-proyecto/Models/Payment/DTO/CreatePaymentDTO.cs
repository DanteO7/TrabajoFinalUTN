namespace backend_proyecto.Models.DTOs
{
    public class CreatePaymentDTO
    {
        public int? UserId { get; set; }
        public int? StudentId { get; set; }
        public int PlanId { get; set; }
        public string PlanType { get; set; } = null!;
        public int TenantId { get; set; }
        public string PaymentMethod { get; set; } = null!;
    }
}