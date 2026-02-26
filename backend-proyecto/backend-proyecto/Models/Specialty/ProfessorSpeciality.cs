namespace backend_proyecto.Models.Specialty
{
    public class ProfessorSpeciality
    {
        public int ProfessorId { get; set; }
        public Professor Professor { get; set; } = null!;
        public int SpecialityId { get; set; }
        public Speciality Speciality { get; set; } = null!;
        
    }
}
