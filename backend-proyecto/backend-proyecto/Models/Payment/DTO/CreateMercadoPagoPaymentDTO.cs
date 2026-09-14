namespace backend_proyecto.Models.DTOs
{
    public class CreateMercadoPagoPaymentDTO
    {
        public int UserId { get; set; }
        public int PlanId { get; set; }
        public string PlanType { get; set; } = null!;
        public int TenantId { get; set; }
    }
}