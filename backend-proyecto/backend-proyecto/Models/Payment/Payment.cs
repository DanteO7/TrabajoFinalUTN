namespace backend_proyecto.Models.Payment
{
    public class Payment
    {
        public int Id { get; set; }
        public int StudentPersonId { get; set; }
        public int PlanId { get; set; }
        public DateTime PaymentDate { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = null!;
    }
}
