namespace backend_proyecto.Models
{
    public class Invitation
    {
        public int Id { get; set; }

        public Guid Token { get; set; }

        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;

        public string Role { get; set; } = null!;

        public DateTime ExpirationDate { get; set; }

        public bool Used { get; set; }
    }
}
