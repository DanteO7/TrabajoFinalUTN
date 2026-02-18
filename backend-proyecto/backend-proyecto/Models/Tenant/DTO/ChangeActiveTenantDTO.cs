using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class ChangeActiveTenantDTO
    {
        [Required]
        public bool IsActive { get; set; }
    }
}
