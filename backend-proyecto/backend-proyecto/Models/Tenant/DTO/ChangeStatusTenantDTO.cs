using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class ChangeStatusTenantDTO
    {
        [Required]
        public string MonthlyFeeStatus { get; set; } = null!;
    }
}
