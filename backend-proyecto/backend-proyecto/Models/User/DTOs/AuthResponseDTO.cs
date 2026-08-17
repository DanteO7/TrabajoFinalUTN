using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class AuthResponseDTO
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Surname { get; set; } = null!;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = null!;

        [Phone]
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        public int? Age { get; set; }
        public int? Weight { get; set; }

        [Required]
        public List<string> Roles { get; set; } = null!;
    }
}