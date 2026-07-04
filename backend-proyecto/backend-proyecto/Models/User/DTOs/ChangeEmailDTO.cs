using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class ChangeEmailDTO
    {
        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string NewEmail { get; set; } = null!;

        [Required]
        [Length(6, 6)]
        public string VerificationCode { get; set; } = null!;
    }
}
