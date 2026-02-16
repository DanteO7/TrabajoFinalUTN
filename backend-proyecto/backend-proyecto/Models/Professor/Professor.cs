using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_proyecto.Models
{
    public class Professor
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;

        [Required]
        public bool IsActive { get; set; }
    }
}
