namespace backend_proyecto.Models
{
    public class ClassTemplateStudent
    {
        public int ClassTemplateId { get; set; }

        public int StudentId { get; set; }

        public ClassTemplate ClassTemplate { get; set; } = null!;

        public Student Student { get; set; } = null!;
    }
}
