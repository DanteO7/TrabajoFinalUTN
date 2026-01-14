using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class LoginDTO
    {
        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(8)]
        [MaxLength(255)]
        public string Password { get; set; } = null!;
    }
}
