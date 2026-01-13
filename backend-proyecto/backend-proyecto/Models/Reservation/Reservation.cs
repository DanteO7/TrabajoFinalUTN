using backend_proyecto.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_proyecto.Models
{
    public class Reservation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [ForeignKey(nameof(Class))]
        public int ClassId { get; set; }
        public Class Class { get; set; } = null!;

        [ForeignKey(nameof(StudentPerson))]
        public int StudentPersonId { get; set; }
        public Person StudentPerson { get; set; } = null!;
        public DateTime ReservationDate { get; set; }

        [Required]
        public ReservationStatus ReservationStatus { get; set; } = null!;
    }
}
