using backend_proyecto.Models;

public class Routine
{
    public int Id { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public ICollection<RoutineExercise> RoutineExercises { get; set; } = new List<RoutineExercise>();
}