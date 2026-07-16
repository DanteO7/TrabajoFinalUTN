namespace backend_proyecto.Models.DTOs
{
    public class ResponseSpecialityDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int TenantId { get; set; }
        public ResponseTenantDTO Tenant { get; set; } = null!;
    }
}
