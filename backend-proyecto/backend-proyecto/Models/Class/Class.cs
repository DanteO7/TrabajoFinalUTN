namespace backend_proyecto.Models.Class
{
    public class Class
    {
        public int Id { get; set; }
        public int ActivityId { get; set; }
        public int ProfessorPersonId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int MaxCapacity { get; set; }
    }
}
