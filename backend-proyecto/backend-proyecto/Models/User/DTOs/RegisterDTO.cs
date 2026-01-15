using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class RegisterDTO
    {
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
        public string PhoneNumber { get; set; } = null!;

        [Required]
        [MinLength(8)]
        [MaxLength(255)]
        public string Password { get; set; } = null!;

        [Required]
        [MinLength(8)]
        [MaxLength(255)]
        public string ConfirmPassword { get; set; } = null!;

        
    }
}
