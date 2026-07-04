namespace backend_proyecto.Models
{
    public class PasswordReset
    {
        public int Id { get; set; }

        public string Email { get; set; } = null!;

        public string Token { get; set; } = null!;

        public DateTime ExpiresAt { get; set; }

        public bool Used { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
