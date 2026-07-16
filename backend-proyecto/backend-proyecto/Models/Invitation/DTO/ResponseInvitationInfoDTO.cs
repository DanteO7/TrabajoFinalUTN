namespace backend_proyecto.Models.DTOs
{
    public class ResponseInvitationInfoDTO
    {
        public string TenantName { get; set; } = null!;
        public string Role { get; set; } = null!;
        public DateTime ExpirationDate { get; set; }
    }
}
