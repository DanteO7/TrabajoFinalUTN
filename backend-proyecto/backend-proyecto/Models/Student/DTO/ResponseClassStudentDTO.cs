namespace backend_proyecto.Models.DTOs
{
    public class ResponseClassStudentDTO
    {
        public int ReservationId { get; set; }

        public int StudentId { get; set; }

        public string Name { get; set; } = null!;

        public string Surname { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string ReservationStatus { get; set; } = null!;
    }
}