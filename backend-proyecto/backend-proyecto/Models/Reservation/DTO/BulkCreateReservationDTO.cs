using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class BulkCreateReservationDTO
    {
        [Required]
        public int ClassId { get; set; }

        [Required]
        public int TenantId { get; set; }

        [Required]
        [MinLength(1)]
        public List<int> StudentIds { get; set; } = new();
    }
}