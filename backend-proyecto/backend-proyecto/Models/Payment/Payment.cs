using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_proyecto.Models.Payment
{
    public class Payment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [ForeignKey(nameof(StudentPerson))]
        public int StudentPersonId { get; set; }
        public Person StudentPerson { get; set; } = null!;

        [ForeignKey(nameof(Plan))]
        public int PlanId { get; set; }
        public Plan Plan { get; set; } = null!;

        public DateTime PaymentDate { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public string PaymentMethod { get; set; } = null!;
    }
}
