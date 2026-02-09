using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_proyecto.Models
{
    public class Tenant
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [ForeignKey(nameof(OwnerUser))]
        public int OwnerUserId { get; set; }
        public User OwnerUser { get; set; } = null!;

        [Required]
        public bool IsActive { get; set; }

        [Required]
        public string Plan { get; set; } = null!;

        [Required]
        public string MonthlyFeeStatus { get; set; } = null!;
    }
}
