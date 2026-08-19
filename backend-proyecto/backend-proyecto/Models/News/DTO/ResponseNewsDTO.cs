namespace backend_proyecto.Models.DTOs
{
    public class ResponseNewsDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int? TenantId { get; set; }
        public UserWithoutPassDTO CreatedByUser { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
    }
}
