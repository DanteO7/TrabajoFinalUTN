using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class ChangePasswordDTO
    {
        [Required]
        [MinLength(8)]
        public string NewPassword { get; set; } = null!;

        [Required]
        public string ConfirmNewPassword { get; set; } = null!;

        [Required]
        public string Token { get; set; } = null!;
    }
}
