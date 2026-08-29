namespace backend_proyecto.Models.DTOs
{
    public class ResponseRoutineExerciseDTO
    {
        public int Id { get; set; }

        public int ExerciseId { get; set; }
        public ResponseExerciseDTO Exercise { get; set; } = null!;

        public int Sets { get; set; }
        public int Repetitions { get; set; }
        public decimal? Weight { get; set; }

        public int Order { get; set; }
    }
}