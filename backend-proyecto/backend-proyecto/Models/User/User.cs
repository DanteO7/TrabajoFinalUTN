namespace backend_proyecto.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Surname { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public int? Age { get; set; }
        public int? Weight { get; set; }
        public string Password { get; set; } = null!;
    }
}