namespace backend_proyecto.Models.DTOs
{
    public class ProfessorPermissionSettingDTO
    {
        public string Name { get; set; } = null!;
        public bool IsAllowed { get; set; }
        public bool IsInherited { get; set; }
        public bool IsOverridden { get; set; }
    }

    public class UpdateProfessorPermissionDTO
    {
        public string Name { get; set; } = null!;
        public bool IsAllowed { get; set; }
    }

    public class UpdateProfessorPermissionsDTO
    {
        public List<UpdateProfessorPermissionDTO> Permissions { get; set; } = new();
    }
}
