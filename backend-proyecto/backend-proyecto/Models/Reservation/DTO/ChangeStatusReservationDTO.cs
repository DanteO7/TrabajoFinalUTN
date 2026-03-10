using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class ChangeStatusReservationDTO
    {
        [Required]
        public string ReservationStatus { get; set; } = null!;
    }
}
