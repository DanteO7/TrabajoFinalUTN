using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class CreateReservationDTO
    {
        [Required]
        public int ClassId { get; set; }

        [Required]
        public int TenantId { get; set; }

        [Required]
        public int StudentId { get; set; }

        [Required]
        public DateTime ReservationDate { get; set; }
    }
}
