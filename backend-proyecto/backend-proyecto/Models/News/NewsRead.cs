namespace backend_proyecto.Models
{
    public class NewsRead
    {
        public int Id { get; set; }
        public int NewsId { get; set; }
        public News News { get; set; } = null!;
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public DateTime ReadAt { get; set; }
    }
}
