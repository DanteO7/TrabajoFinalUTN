using backend_proyecto.models.DTOs;

public class UpdateRoutineDTO
{
    public string? Name { get; set; }
    public string? Description { get; set; }

    public List<RoutineExerciseDTO> Exercises { get; set; } = new();
}