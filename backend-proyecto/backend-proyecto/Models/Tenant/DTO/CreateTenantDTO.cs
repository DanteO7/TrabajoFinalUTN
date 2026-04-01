using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class CreateTenantDTO
    {
        [Required]
        public int OwnerUserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = null!;

        [Required]
        public int TenantPlanId { get; set; }
    }
}
