using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class RequestTenantDTO
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = null!;

        [Required]
        public int TenantPlanId { get; set; }

        [Required]
        public IFormFile Comprobante { get; set; } = null!;
    }
}