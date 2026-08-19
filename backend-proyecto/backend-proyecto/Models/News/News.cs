namespace backend_proyecto.Models
{
    public class News
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int? TenantId { get; set; }
        public Tenant? Tenant { get; set; }
        public int CreatedByUserId { get; set; }
        public User CreatedByUser { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public ICollection<NewsRead> Reads { get; set; } = new List<NewsRead>();
    }
}
