namespace backend_proyecto.Models.Reservation
{
    public class Reservation
    {
        public int Id { get; set; }
        public int ClassId { get; set; }
        public int StudentPersonId { get; set; }
        public DateTime ReservationDate { get; set; }
        public string Status { get; set; } = null!;
    }
}
