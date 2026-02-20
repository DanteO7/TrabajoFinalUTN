using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_proyecto.Models.DTOs
{
    public class CreateSpecialityDTO
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = null!;

        [Required]
        public int TenantId { get; set; }
    }
}
