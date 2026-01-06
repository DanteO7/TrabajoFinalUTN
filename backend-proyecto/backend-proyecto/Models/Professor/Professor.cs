namespace backend_proyecto.Models.Professor
{
    public class Professor
    {
        public int PersonId { get; set; }
        public Person Person { get; set; } = null!;
    }
}
