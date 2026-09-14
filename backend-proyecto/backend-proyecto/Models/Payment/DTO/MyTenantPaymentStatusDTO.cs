namespace backend_proyecto.Models.DTOs
{
    public class MyTenantPaymentStatusDTO
    {
        public int TenantId { get; set; }
        public string TenantName { get; set; } = null!;

        public string PlanName { get; set; } = null!;
        public decimal PlanPrice { get; set; }

        public string MonthlyFeeStatus { get; set; } = null!;
        public DateTime? MonthlyFeeStatusUpdatedAt { get; set; }

        public bool MercadoPagoConnected { get; set; }
    }
}
