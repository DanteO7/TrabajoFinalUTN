namespace backend_proyecto.Models.DTOs
{
    public class ResponseWaitlistDTO
    {
        public int Id { get; set; }
        public int ClassId { get; set; }
        public int StudentId { get; set; }
        public int TenantId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}