namespace backend_proyecto.Models.DTOs
{
    public class ResponseStudentDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public UserWithoutPassDTO User { get; set; } = null!;
        public int TenantId { get; set; }
        public int StudentPlanId { get; set; }
        public ResponseStudentPlanDTO StudentPlan { get; set; } = null!;
        public string MonthlyFeeStatus { get; set; } = null!;
    }
}
