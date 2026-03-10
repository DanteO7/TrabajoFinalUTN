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

        public int ClassId { get; set; }
        public Class Class { get; set; } = null!;

        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;

        public int StudentId { get; set; }
        public Student Student { get; set; } = null!;

        public DateTime ReservationDate { get; set; }

        [Required]
        public string ReservationStatus { get; set; } = null!;
    }
}
