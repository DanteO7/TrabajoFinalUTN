using backend_proyecto.Models;

public class ClassTemplate
{
    public int Id { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public DayOfWeek DayOfWeek { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public int ActivityId { get; set; }
    public Activity Activity { get; set; } = null!;

    public int ProfessorId { get; set; }
    public Professor Professor { get; set; } = null!;

    public int MaxCapacity { get; set; }
    public ICollection<ClassTemplateStudent> Students { get; set; }
        = new List<ClassTemplateStudent>();
}