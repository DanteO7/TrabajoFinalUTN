namespace backend_proyecto.Models.DTOs
{
    public class StatisticsSummaryDTO
    {
        public string Period { get; set; } = null!;
        public int ActiveStudents { get; set; }
        public int Reservations { get; set; }
        public decimal? AverageOccupancyPercentage { get; set; }
        public string? OccupancyUnavailableReason { get; set; }
        public decimal RecordedRevenue { get; set; }
    }

    public class StatisticsClassesDTO
    {
        public string Period { get; set; } = null!;
        public bool DeliveryTrackingAvailable { get; set; }
        public string? UnavailableReason { get; set; }
        public List<WeekdayOccupancyDTO> WeekdayOccupancy { get; set; } = new();
        public List<ActivityOccupancyDTO> ActivityOccupancy { get; set; } = new();
    }

    public class WeekdayOccupancyDTO
    {
        public int DayOfWeek { get; set; }
        public string DayName { get; set; } = null!;
        public int ClassesConsidered { get; set; }
        public int AvailableSpots { get; set; }
        public int OccupiedSpots { get; set; }
        public decimal? OccupancyPercentage { get; set; }
    }

    public class ActivityOccupancyDTO
    {
        public int ActivityId { get; set; }
        public string ActivityName { get; set; } = null!;
        public int ClassesConsidered { get; set; }
        public int AvailableSpots { get; set; }
        public int OccupiedSpots { get; set; }
        public decimal? OccupancyPercentage { get; set; }
    }

    public class StatisticsStudentsDTO
    {
        public int ActiveStudents { get; set; }
        public int NewStudentsThisMonth { get; set; }
        public int NewStudentsLastThreeMonths { get; set; }
        public int NewStudentsThisYear { get; set; }
        public int ActiveProfessors { get; set; }
        public List<MonthlyStudentCountDTO> MonthlyEvolution { get; set; } = new();
        public List<StudentPlanCountDTO> StudentsByPlan { get; set; } = new();
    }

    public class MonthlyStudentCountDTO
    {
        public string Month { get; set; } = null!;
        public int NewStudents { get; set; }
    }

    public class StudentPlanCountDTO
    {
        public int StudentPlanId { get; set; }
        public string StudentPlanName { get; set; } = null!;
        public int Students { get; set; }
    }

    public class StatisticsProfessorsDTO
    {
        public string Period { get; set; } = null!;
        public bool DeliveryTrackingAvailable { get; set; }
        public string? UnavailableReason { get; set; }
        public List<ProfessorStatisticsDTO> Professors { get; set; } = new();
    }

    public class ProfessorStatisticsDTO
    {
        public int ProfessorId { get; set; }
        public string Name { get; set; } = null!;
        public string Surname { get; set; } = null!;
        public int? ClassesTaught { get; set; }
        public List<ProfessorActivityShareDTO> Activities { get; set; } = new();
    }

    public class ProfessorActivityShareDTO
    {
        public int ActivityId { get; set; }
        public string ActivityName { get; set; } = null!;
        public int ClassesTaught { get; set; }
        public decimal Percentage { get; set; }
    }

    public class StatisticsPaymentsDTO
    {
        public string Period { get; set; } = null!;
        public string Grouping { get; set; } = null!;
        public decimal TotalRevenue { get; set; }
        public List<PaymentRevenueBucketDTO> RevenueByPeriod { get; set; } = new();
        public List<PaymentMethodShareDTO> PaymentsByMethod { get; set; } = new();
    }

    public class PaymentRevenueBucketDTO
    {
        public string Period { get; set; } = null!;
        public decimal Amount { get; set; }
    }

    public class PaymentMethodShareDTO
    {
        public string Method { get; set; } = null!;
        public int Payments { get; set; }
        public decimal Percentage { get; set; }
    }
}
