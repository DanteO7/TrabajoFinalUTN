using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_proyecto.Models
{
    public class StudentPlan
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = null!;

        [Required]
        public int ClassesPerMonth { get; set; }

        [Required]
        public decimal Price { get; set; }
    }
}
