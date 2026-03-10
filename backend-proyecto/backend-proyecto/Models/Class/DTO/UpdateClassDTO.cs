namespace backend_proyecto.Models.DTOs
{
    public class UpdateClassDTO
    {
        public int? ActivityId { get; set; }
        public int? ProfessorId { get; set; }
        public int? TenantId { get; set; }
        public DateTime? Date { get; set; }
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public int? MaxCapacity { get; set; }
    }
}
