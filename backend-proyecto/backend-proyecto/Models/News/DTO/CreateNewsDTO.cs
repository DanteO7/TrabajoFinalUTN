using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class CreateNewsDTO
    {
        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = null!;

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = null!;

        public int? TenantId { get; set; }

    }
}
