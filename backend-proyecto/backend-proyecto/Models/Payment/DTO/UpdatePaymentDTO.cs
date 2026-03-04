namespace backend_proyecto.Models.DTOs
{
    public class UpdatePaymentDTO
    {
        public int? UserId { get; set; }
        public int? PlanId { get; set; }
        public string? PlanType { get; set; } = null!;
        public int? TenantId { get; set; }
        public decimal? Amount { get; set; }
        public string? PaymentMethod { get; set; } = null!;
    }
}
