namespace backend_proyecto.Models.Plan
{
    public class Plan
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int ClassesInWeek { get; set; }
        public decimal Price { get; set; }
    }
}
