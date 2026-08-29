namespace backend_proyecto.Models.DTOs
{
    public class CreateExerciseDTO
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}