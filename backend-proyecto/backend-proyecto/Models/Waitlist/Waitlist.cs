namespace backend_proyecto.Models
{
    public class Waitlist
    {
        public int Id { get; set; }

        public int ClassId { get; set; }
        public Class Class { get; set; } = null!;

        public int StudentId { get; set; }
        public Student Student { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}