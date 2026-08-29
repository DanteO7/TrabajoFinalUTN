using backend_proyecto.models.DTOs;

namespace backend_proyecto.Models.DTOs
{
    public class UpdateRoutineDTO
    {
        public string? Name { get; set; }
        public string? Description { get; set; }

        public List<RoutineExerciseDTO>? Exercises { get; set; } = new();
    }
}