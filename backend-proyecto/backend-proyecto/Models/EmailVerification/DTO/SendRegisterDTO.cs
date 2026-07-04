using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class SendRegisterCodeDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;
    }
}