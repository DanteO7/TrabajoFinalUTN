using System.Text.Json.Serialization;

namespace backend_proyecto.Models.DTOs
{
    public class MercadoPagoPaymentResponseDTO
    {
        public long Id { get; set; }

        public string Status { get; set; } = null!;

        [JsonPropertyName("status_detail")]
        public string? StatusDetail { get; set; }

        [JsonPropertyName("transaction_amount")]
        public decimal TransactionAmount { get; set; }

        [JsonPropertyName("external_reference")]
        public string? ExternalReference { get; set; }

        [JsonPropertyName("collector_id")]
        public long? CollectorId { get; set; }

        [JsonPropertyName("currency_id")]
        public string CurrencyId { get; set; } = null!;
    }
}