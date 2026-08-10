namespace backend_proyecto.Models
{
    public class Class
    {
        public int Id { get; set; }
        public int ActivityId { get; set; }
        public Activity Activity { get; set; } = null!;
        public int ProfessorId { get; set; }
        public Professor Professor { get; set; } = null!;
        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
        public DateOnly Date { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public int MaxCapacity { get; set; }
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public ICollection<Waitlist> Waitlists { get; set; } = new List<Waitlist>();
    }
}