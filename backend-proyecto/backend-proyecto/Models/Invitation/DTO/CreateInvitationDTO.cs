namespace backend_proyecto.Models.DTOs
{
    public class CreateInvitationDTO
    {
        public int TenantId { get; set; }
        public string Role { get; set; } = null!;
    }
}
