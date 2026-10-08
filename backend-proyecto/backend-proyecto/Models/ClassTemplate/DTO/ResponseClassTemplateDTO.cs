namespace backend_proyecto.Models.DTOs
{
    public class ResponseClassTemplateDTO
    {
        public int Id { get; set; }

        public DayOfWeek DayOfWeek { get; set; }

        public TimeOnly StartTime { get; set; }

        public TimeOnly EndTime { get; set; }

        public int ActivityId { get; set; }

        public string ActivityName { get; set; } = null!;

        public int ProfessorId { get; set; }

        public string ProfessorName { get; set; } = null!;
        public string ProfessorSurname { get; set; } = null!;

        public int MaxCapacity { get; set; }

        public List<ResponseClassTemplateStudentDTO> Students { get; set; }
            = new();
    }
}
