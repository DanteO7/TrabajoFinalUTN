using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class CreateActivityDTO
    {
        [Required]
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        [Required]
        public int TenantId { get; set; }
    }
}
