namespace backend_proyecto.Models.DTOs
{
    public class MercadoPagoPaymentResponseDTO
    {
        public long Id { get; set; }

        public string Status { get; set; } = null!;

        public string? StatusDetail { get; set; }

        public decimal TransactionAmount { get; set; }

        public string? ExternalReference { get; set; }

        public long? CollectorId { get; set; }

        public string CurrencyId { get; set; } = null!;
    }
}