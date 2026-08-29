namespace backend_proyecto.Models
{
    public class Professor
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
        public bool IsActive { get; set; }
        public ICollection<ProfessorSpeciality> ProfessorSpecialities { get; set; } = new List<ProfessorSpeciality>();
        public ICollection<ProfessorPermission> ProfessorPermissions { get; set; } = new List<ProfessorPermission>();
    }
}