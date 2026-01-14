using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend_proyecto.Models;

namespace backend_proyecto.Models
{
    public class Class
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [ForeignKey(nameof(Activity))]
        public int ActivityId { get; set; }
        public Activity Activity { get; set; } = null!;

        [ForeignKey(nameof(ProfessorPerson))]
        public int ProfessorPersonId { get; set; }
        public Person ProfessorPerson { get; set; } = null!;

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        [Required]
        public int MaxCapacity { get; set; }
    }
}
