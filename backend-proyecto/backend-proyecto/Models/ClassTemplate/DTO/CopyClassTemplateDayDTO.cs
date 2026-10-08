namespace backend_proyecto.Models.DTOs
{
    public class CopyClassTemplateDayDTO
    {
        public DayOfWeek DayOfWeek { get; set; }
        public DateOnly DestinationDate { get; set; }
    }
}
