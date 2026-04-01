using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class UpdateTenantDTO
    {
        public bool? IsActive { get; set; }

        public int? TenantPlanId { get; set; }

        [MaxLength(50)]
        public string? Name { get; set; }

        public string? MonthlyFeeStatus { get; set; }
    }
}