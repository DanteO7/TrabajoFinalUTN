using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class ChangePlanTenantDTO
    {
        [Required]
        public int TenantPlanId { get; set; }
    }
}
