namespace backend_proyecto.Models
{
    public class Student
    {
        public int IdPerson { get; set; }
        public Person Person { get; set; } = null!;

        public int IdPlan { get; set; }
        public string  MonthlyFeeStatus { get; set; } = null!;
    }
}
