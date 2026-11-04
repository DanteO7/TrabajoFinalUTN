using System.Text.Json.Serialization;

namespace backend_proyecto.Models.DTOs
{
    public class MercadoPagoWebhookDTO
    {
        public long Id { get; set; }

        [JsonPropertyName("live_mode")]
        public bool LiveMode { get; set; }

        public string? Type { get; set; }

        [JsonPropertyName("date_created")]
        public DateTime DateCreated { get; set; }

        [JsonPropertyName("user_id")]
        public long? UserId { get; set; }

        [JsonPropertyName("api_version")]
        public string? ApiVersion { get; set; }

        public string? Action { get; set; }

        public MercadoPagoWebhookDataDTO? Data { get; set; }
    }

    public class MercadoPagoWebhookDataDTO
    {
        public string? Id { get; set; }
    }
}