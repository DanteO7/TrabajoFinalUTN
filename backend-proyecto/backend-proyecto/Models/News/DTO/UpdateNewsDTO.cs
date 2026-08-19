using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class UpdateNewsDTO
    {
        public string? Title { get; set; } = null!;
        public string? Content { get; set; } = null!;
        public int? TenantId { get; set; } = null!;
    }
}
