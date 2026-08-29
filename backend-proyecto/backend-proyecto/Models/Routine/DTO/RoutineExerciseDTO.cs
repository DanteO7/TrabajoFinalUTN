namespace backend_proyecto.models.DTOs
{
    public class RoutineExerciseDTO
    {
        public int ExerciseId { get; set; }

        public int Sets { get; set; }

        public int Repetitions { get; set; }

        public decimal? Weight { get; set; }

        public int Order { get; set; }
    }
}