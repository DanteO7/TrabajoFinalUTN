namespace backend_proyecto.Models.Specialty
{
    public class ProfessorSpeciality
    {
        public int PersonId { get; set; }
        public Professor.Professor Professor { get; set; } = null!;
        public int SpecialityId { get; set; }
        public Speciality Speciality { get; set; } = null!;
        
    }
}
