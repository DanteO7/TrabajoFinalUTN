using backend_proyecto.models.DTOs;

namespace backend_proyecto.Models.DTOs
{
    public class CreateRoutineDTO
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        public List<RoutineExerciseDTO> Exercises { get; set; } = new();
    }
}