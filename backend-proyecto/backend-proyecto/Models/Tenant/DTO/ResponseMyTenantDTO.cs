namespace backend_proyecto.Models.DTOs
{
    public class ResponseMyTenantDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Address { get; set; }
        public string Role { get; set; } = null!;
        public string OwnerName { get; set; } = null!; 
        public bool IsActive { get; set; }
    }
}