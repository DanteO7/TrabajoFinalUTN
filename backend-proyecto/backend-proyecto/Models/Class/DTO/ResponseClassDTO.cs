namespace backend_proyecto.Models.DTOs
{
    public class ResponseClassDTO
    {
        public int Id { get; set; }
        public int ActivityId { get; set; }
        public ResponseActivityDTO Activity { get; set; } = null!;
        public int ProfessorId { get; set; }
        public ResponseProfessorDTO Professor { get; set; } = null!;
        public int TenantId { get; set; }
        public DateTime Date { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public int MaxCapacity { get; set; }
        public int ReservationsCount { get; set; }
        public int AvailableSpots { get; set; }
    }
}
