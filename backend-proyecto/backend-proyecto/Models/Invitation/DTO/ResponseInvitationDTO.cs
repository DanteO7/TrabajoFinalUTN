namespace backend_proyecto.Models.DTOs
{
    public class ResponseInvitationDTO
    {
        public string Link { get; set; } = null!;
        public DateTime? ExpirationDate { get; set; }
    }
}
