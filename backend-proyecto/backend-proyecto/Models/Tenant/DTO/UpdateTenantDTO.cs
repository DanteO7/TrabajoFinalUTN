using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class UpdateTenantDTO
    {
        public int? TenantPlanId { get; set; }

        [MaxLength(50)]
        public string? Name { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }
        public Dictionary<string, string>? SocialNetworks { get; set; }

        [MaxLength(100)]
        public string? Alias { get; set; }

        [MaxLength(22)]
        public string? CBU { get; set; }

        [Range(1, 1440,
            ErrorMessage = "La anticipación debe ser un número entero entre 1 y 1440 minutos.")]
        public int? CancellationDeadlineMinutes { get; set; }
    }
}