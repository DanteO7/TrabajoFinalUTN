using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class ResponseReservationDTO
    {
        public int Id { get; set; }
        public int ClassId { get; set; }
        public ResponseClassDTO Class { get; set; } = null!;
        public int TenantId { get; set; }
        public int StudentId { get; set; }
        public ResponseStudentDTO Student { get; set; } = null!;
        public DateTime ReservationDate { get; set; }
        public string ReservationStatus { get; set; } = null!;
    }
}
