using backend_proyecto.Models.Specialty;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_proyecto.Models
{
    public class Speciality
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = null!;

        [ForeignKey(nameof(Tenant))]
        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
        public ICollection<ProfessorSpeciality> ProfessorSpecialities { get; set; } = new List<ProfessorSpeciality>();
    }
}
