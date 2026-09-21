namespace backend_proyecto.Models
{
    public class Tenant
    {
        public int Id { get; set; }
        public int OwnerUserId { get; set; }
        public User OwnerUser { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Address { get; set; }
        public Dictionary<string, string>? SocialNetworks { get; set; } = new();
        public bool IsActive { get; set; }
        public int TenantPlanId { get; set; }
        public TenantPlan TenantPlan { get; set; } = null!;
        public string MonthlyFeeStatus { get; set; } = null!;
        public DateTime? MonthlyFeeStatusUpdatedAt { get; set; }
        public DateTime? PaymentDueDate { get; set; }

        // Mercado Pago
        public string? MercadoPagoAccessToken { get; set; }
        public string? MercadoPagoRefreshToken { get; set; }
        public DateTime? MercadoPagoTokenExpiresAt { get; set; }
        public string? MercadoPagoUserId { get; set; }

        // Transferencia
        public string? Alias { get; set; }
        public string? CBU { get; set; }

        public ICollection<Professor> Professors { get; set; } = new List<Professor>();
        public ICollection<Student> Students { get; set; } = new List<Student>();
    }
}