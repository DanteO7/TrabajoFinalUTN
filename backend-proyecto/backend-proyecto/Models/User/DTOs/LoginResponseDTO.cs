namespace backend_proyecto.Models.DTOs
{
    public class LoginResponseDTO
    {
        public string Token { get; set; } = null!;
        public UserWithoutPassDTO User { get; set; } = null!;
    }
}
