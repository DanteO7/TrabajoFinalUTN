namespace backend_proyecto.Models.DTOs
{
    public class ResponsePaymentDTO
    {
        public int Id { get; set; }

        public int? UserId { get; set; }
        public UserWithoutPassDTO? User { get; set; }

        public int? StudentId { get; set; }
        public string? StudentName { get; set; }
        public string? StudentSurname { get; set; }

        public int PlanId { get; set; }
        public string PlanName { get; set; } = null!;
        public string PlanType { get; set; } = null!;
        public int TenantId { get; set; }
        public string TenantName { get; set; } = null!;
        public DateTime PaymentDate { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? ExternalPaymentId { get; set; }
    }
}