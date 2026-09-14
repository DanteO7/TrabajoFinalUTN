namespace backend_proyecto.Config
{
    public class MercadoPagoSettings
    {
        public string ClientId { get; set; } = null!;
        public string ClientSecret { get; set; } = null!;
        public string RedirectUri { get; set; } = null!;
        public string FrontendUrl { get; set; } = null!; 
        public string BackendUrl { get; set; } = null!;
    }
}