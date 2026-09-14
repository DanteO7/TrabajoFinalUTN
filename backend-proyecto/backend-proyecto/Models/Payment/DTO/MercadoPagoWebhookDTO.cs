namespace backend_proyecto.Models.DTOs
{
    public class MercadoPagoWebhookDTO
    {
        public long Id { get; set; }

        public bool LiveMode { get; set; }

        public string? Type { get; set; }

        public DateTime DateCreated { get; set; }

        public long UserId { get; set; }

        public string? ApiVersion { get; set; }

        public string? Action { get; set; }

        public MercadoPagoWebhookDataDTO? Data { get; set; }
    }

    public class MercadoPagoWebhookDataDTO
    {
        public string? Id { get; set; }
    }
}