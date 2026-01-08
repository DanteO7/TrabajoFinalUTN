using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_proyecto.Models.Professor
{
    public class Professor
    {
        [Key]
        [ForeignKey(nameof(Person))]
        public int PersonId { get; set; }
        public Person Person { get; set; } = null!;
    }
}
