namespace backend_proyecto.Models.DTOs
{
    public class LoginResponseDTO
    {
        public string Token { get; set; } = null!;
        public PersonWithoutPassDTO Person { get; set; } = null!;
    }
}
