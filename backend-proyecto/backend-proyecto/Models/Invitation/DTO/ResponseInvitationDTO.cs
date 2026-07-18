namespace backend_proyecto.Models.DTOs
{
    public class ResponseInvitationDTO
    {
        public int Id { get; set; }
        public string Link { get; set; } = null!;
        public DateTime? ExpirationDate { get; set; }
    }
}
