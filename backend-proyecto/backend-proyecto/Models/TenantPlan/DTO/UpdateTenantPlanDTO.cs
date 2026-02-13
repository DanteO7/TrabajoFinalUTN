namespace backend_proyecto.Models.DTOs
{
    public class UpdateTenantPlanDTO
    {
        public string? Name { get; set; } = null!;
        public decimal? Price { get; set; }
        public int? MaxStudents { get; set; }
        public int? MaxProfessors { get; set; }
    }
}
