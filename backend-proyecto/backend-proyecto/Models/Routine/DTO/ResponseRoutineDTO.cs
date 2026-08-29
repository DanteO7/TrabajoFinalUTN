namespace backend_proyecto.Models.DTOs
{
    public class ResponseRoutineDTO
    {
        public int Id { get; set; }

        public int TenantId { get; set; }

        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        public List<ResponseRoutineExerciseDTO> Exercises { get; set; } = new();
    }
}