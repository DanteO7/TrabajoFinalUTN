namespace backend_proyecto.Models.DTOs
{
    public class UpdateProfessorDTO
    {
        public bool? IsActive { get; set; }
        public List<int>? SpecialityIds { get; set; }
    }
}
