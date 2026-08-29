public class RoutineExercise
{
    public int Id { get; set; }

    public int RoutineId { get; set; }
    public Routine Routine { get; set; } = null!;

    public int ExerciseId { get; set; }
    public Exercise Exercise { get; set; } = null!;

    public int Sets { get; set; }
    public int Repetitions { get; set; }
    public decimal? Weight { get; set; }

    public int Order { get; set; }
}