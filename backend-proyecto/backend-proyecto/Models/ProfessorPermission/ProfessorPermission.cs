namespace backend_proyecto.Models
{
    public class ProfessorPermission
    {
        public int ProfessorId { get; set; }
        public Professor Professor { get; set; } = null!;

        public int PermissionId { get; set; }
        public Permission Permission { get; set; } = null!;

        public bool IsAllowed { get; set; }
    }
}