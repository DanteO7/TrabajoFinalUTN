namespace backend_proyecto.Models.DTOs
{
    public class ResponseTenantPlanDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public int MaxStudents { get; set; }
        public int MaxProfessors { get; set; }
    }
}
