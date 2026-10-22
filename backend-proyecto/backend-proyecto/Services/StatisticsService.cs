using backend_proyecto.Config;
using backend_proyecto.Enums;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Utils;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Net;

namespace backend_proyecto.Services
{
    public class StatisticsService
    {
        private const string DeliveryTrackingUnavailableReasonCode =
            "CLASS_TRACKING_UNAVAILABLE";

        private static readonly string[] WeekdayNames =
        [
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
            "Domingo"
        ];
        private static readonly DayOfWeek[] WeekdaysInDisplayOrder =
        [
            DayOfWeek.Monday,
            DayOfWeek.Tuesday,
            DayOfWeek.Wednesday,
            DayOfWeek.Thursday,
            DayOfWeek.Friday,
            DayOfWeek.Saturday,
            DayOfWeek.Sunday
        ];

        private readonly ApplicationDbContext _db;
        private readonly CurrentTenantService _currentTenantService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public StatisticsService(
            ApplicationDbContext db,
            CurrentTenantService currentTenantService,
            IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _currentTenantService = currentTenantService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<StatisticsSummaryDTO> GetSummary(string period)
        {
            var tenantId = await EnsureOwner();
            var range = GetRange(period);
            var reservations = _db.Reservations
                .Where(r => r.TenantId == tenantId);

            if (range.Start.HasValue)
                reservations = reservations.Where(r => r.Class.Date >= range.Start.Value);
            if (range.EndExclusive.HasValue)
                reservations = reservations.Where(r => r.Class.Date < range.EndExclusive.Value);

            var validReservationStatuses = new[]
            {
                ReservationStatus.PENDING,
                ReservationStatus.CONFIRMED,
                ReservationStatus.COMPLETED
            };

            var reservationCount = await reservations
                .CountAsync(r => validReservationStatuses.Contains(r.ReservationStatus));

            var payments = GetRecordedPayments(tenantId, range);
            var revenue = await payments.SumAsync(p => (decimal?)p.Amount) ?? 0m;
            var activeStudents = await _db.Students.CountAsync(s =>
                s.TenantId == tenantId &&
                s.MonthlyFeeStatus == MonthlyFeeStatus.PAID);

            return new StatisticsSummaryDTO
            {
                Period = period,
                ActiveStudents = activeStudents,
                Reservations = reservationCount,
                AverageOccupancyPercentage = null,
                OccupancyUnavailableReason = DeliveryTrackingUnavailableReasonCode,
                RecordedRevenue = decimal.Round(revenue, 2)
            };
        }

        public async Task<StatisticsClassesDTO> GetClasses(string period)
        {
            await EnsureOwner();
            _ = GetRange(period);

            return new StatisticsClassesDTO
            {
                Period = period,
                DeliveryTrackingAvailable = false,
                UnavailableReason = DeliveryTrackingUnavailableReasonCode,
                WeekdayOccupancy = WeekdaysInDisplayOrder
                    .Select((day, index) => new WeekdayOccupancyDTO
                    {
                        DayOfWeek = (int)day,
                        DayName = WeekdayNames[index],
                        ClassesConsidered = 0,
                        AvailableSpots = 0,
                        OccupiedSpots = 0,
                        OccupancyPercentage = null
                    })
                    .ToList(),
                ActivityOccupancy = new List<ActivityOccupancyDTO>()
            };
        }

        public async Task<StatisticsStudentsDTO> GetStudents()
        {
            var tenantId = await EnsureOwner();

            var now = TimeHelper.Now();
            var tomorrowUtc = LocalDateToUtc(DateOnly.FromDateTime(now).AddDays(1));
            var monthStart = LocalDateToUtc(new DateOnly(now.Year, now.Month, 1));
            var threeMonthsStart = LocalDateToUtc(new DateOnly(now.Year, now.Month, 1).AddMonths(-2));
            var yearStart = LocalDateToUtc(new DateOnly(now.Year, 1, 1));
            var evolutionStartDate = new DateOnly(now.Year, now.Month, 1).AddMonths(-11);
            var evolutionStart = LocalDateToUtc(evolutionStartDate);

            var students = _db.Students.Where(s => s.TenantId == tenantId);
            var activeStudents = await students.CountAsync(s =>
                s.MonthlyFeeStatus == MonthlyFeeStatus.PAID);
            var thisMonth = await students.CountAsync(s =>
                s.JoinedAt >= monthStart && s.JoinedAt < tomorrowUtc);
            var lastThreeMonths = await students.CountAsync(s =>
                s.JoinedAt >= threeMonthsStart && s.JoinedAt < tomorrowUtc);
            var thisYear = await students.CountAsync(s =>
                s.JoinedAt >= yearStart && s.JoinedAt < tomorrowUtc);

            var monthlyCounts = await students
                .Where(s => s.JoinedAt >= evolutionStart && s.JoinedAt < tomorrowUtc)
                .GroupBy(s => new { s.JoinedAt.Year, s.JoinedAt.Month })
                .Select(group => new
                {
                    group.Key.Year,
                    group.Key.Month,
                    Count = group.Count()
                })
                .ToListAsync();
            var monthlyCountLookup = monthlyCounts.ToDictionary(
                row => (row.Year, row.Month),
                row => row.Count);

            var monthlyEvolution = Enumerable.Range(0, 12)
                .Select(offset => evolutionStartDate.AddMonths(offset))
                .Select(month => new MonthlyStudentCountDTO
                {
                    Month = month.ToString("yyyy-MM", CultureInfo.InvariantCulture),
                    NewStudents = monthlyCountLookup.GetValueOrDefault((month.Year, month.Month))
                })
                .ToList();

            var byPlan = await students
                .GroupBy(s => new { s.StudentPlanId, s.StudentPlan.Name })
                .Select(group => new StudentPlanCountDTO
                {
                    StudentPlanId = group.Key.StudentPlanId,
                    StudentPlanName = group.Key.Name,
                    Students = group.Count()
                })
                .OrderBy(row => row.StudentPlanName)
                .ToListAsync();

            var activeProfessors = await _db.Professors.CountAsync(p =>
                p.TenantId == tenantId && p.IsActive);

            return new StatisticsStudentsDTO
            {
                ActiveStudents = activeStudents,
                NewStudentsThisMonth = thisMonth,
                NewStudentsLastThreeMonths = lastThreeMonths,
                NewStudentsThisYear = thisYear,
                ActiveProfessors = activeProfessors,
                MonthlyEvolution = monthlyEvolution,
                StudentsByPlan = byPlan
            };
        }

        public async Task<StatisticsProfessorsDTO> GetProfessors(
            string period)
        {
            var tenantId = await EnsureOwner();
            _ = GetRange(period);

            var professors = await _db.Professors
                .Where(p => p.TenantId == tenantId && p.IsActive)
                .OrderBy(p => p.User.Surname)
                .ThenBy(p => p.User.Name)
                .Select(p => new ProfessorStatisticsDTO
                {
                    ProfessorId = p.Id,
                    Name = p.User.Name,
                    Surname = p.User.Surname,
                    ClassesTaught = null,
                    Activities = new List<ProfessorActivityShareDTO>()
                })
                .ToListAsync();

            return new StatisticsProfessorsDTO
            {
                Period = period,
                DeliveryTrackingAvailable = false,
                UnavailableReason = DeliveryTrackingUnavailableReasonCode,
                Professors = professors
            };
        }

        public async Task<StatisticsPaymentsDTO> GetPayments(string period)
        {
            var tenantId = await EnsureOwner();
            var range = GetRange(period);
            var payments = GetRecordedPayments(tenantId, range);
            var totalRevenue = await payments.SumAsync(p => (decimal?)p.Amount) ?? 0m;

            var grouping = period == "month" ? "day" : "month";
            List<PaymentRevenueBucketDTO> revenueRows;
            if (grouping == "day")
            {
                var dailyRows = await payments
                    .GroupBy(p => p.PaymentDate.Date)
                    .Select(group => new
                    {
                        Date = group.Key,
                        Amount = group.Sum(p => p.Amount)
                    })
                    .OrderBy(row => row.Date)
                    .ToListAsync();
                revenueRows = dailyRows.Select(row => new PaymentRevenueBucketDTO
                {
                    Period = row.Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    Amount = row.Amount
                }).ToList();
            }
            else
            {
                var monthlyRows = await payments
                    .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
                    .Select(group => new
                    {
                        group.Key.Year,
                        group.Key.Month,
                        Amount = group.Sum(p => p.Amount)
                    })
                    .OrderBy(row => row.Year)
                    .ThenBy(row => row.Month)
                    .ToListAsync();
                revenueRows = monthlyRows.Select(row => new PaymentRevenueBucketDTO
                {
                    Period = $"{row.Year:0000}-{row.Month:00}",
                    Amount = row.Amount
                }).ToList();
            }

            var methodCounts = await payments
                .GroupBy(p => p.PaymentMethod)
                .Select(group => new
                {
                    Method = group.Key,
                    Count = group.Count()
                })
                .OrderByDescending(row => row.Count)
                .ToListAsync();
            var paymentCount = methodCounts.Sum(row => row.Count);

            return new StatisticsPaymentsDTO
            {
                Period = period,
                Grouping = grouping,
                TotalRevenue = decimal.Round(totalRevenue, 2),
                RevenueByPeriod = revenueRows,
                PaymentsByMethod = methodCounts.Select(row =>
                    new PaymentMethodShareDTO
                    {
                        Method = row.Method,
                        Payments = row.Count,
                        Percentage = paymentCount == 0
                            ? 0
                            : decimal.Round(row.Count * 100m / paymentCount, 2)
                    }).ToList()
            };
        }

        private IQueryable<backend_proyecto.Models.Payment> GetRecordedPayments(
            int tenantId,
            (DateOnly? Start, DateOnly? EndExclusive) range)
        {
            var payments = _db.Payments.Where(p =>
                p.TenantId == tenantId &&
                p.PlanType == PlanType.STUDENT &&
                p.Status == PaymentStatus.PAID);

            if (range.Start.HasValue)
            {
                var start = LocalDateToUtc(range.Start.Value);
                payments = payments.Where(p => p.PaymentDate >= start);
            }

            if (range.EndExclusive.HasValue)
            {
                var end = LocalDateToUtc(range.EndExclusive.Value);
                payments = payments.Where(p => p.PaymentDate < end);
            }

            return payments;
        }

        private async Task<int> EnsureOwner()
        {
            var tenantId = _currentTenantService.GetRequiredTenantId();

            var userIdValue = _httpContextAccessor.HttpContext?.User.FindFirst("id")?.Value;
            if (!int.TryParse(userIdValue, out var userId))
            {
                throw new HttpResponseError(
                    HttpStatusCode.Unauthorized,
                    "No se pudo identificar al usuario.");
            }

            var isOwner = await _db.Tenants.AnyAsync(t =>
                t.Id == tenantId && t.OwnerUserId == userId);
            if (!isOwner)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "Solo el dueño del negocio puede consultar sus estadísticas.");
            }

            return tenantId;
        }

        private static (DateOnly? Start, DateOnly? EndExclusive) GetRange(string period)
        {
            var today = DateOnly.FromDateTime(TimeHelper.Now());
            var startOfMonth = new DateOnly(today.Year, today.Month, 1);

            return period switch
            {
                "month" => (startOfMonth, today.AddDays(1)),
                "last3months" => (startOfMonth.AddMonths(-2), today.AddDays(1)),
                "year" => (new DateOnly(today.Year, 1, 1), today.AddDays(1)),
                "all" => (null, null),
                _ => throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El período debe ser month, last3months, year o all.")
            };
        }

        private static DateTime LocalDateToUtc(DateOnly date)
        {
            var argentinaTimeZone = TimeZoneInfo.FindSystemTimeZoneById(
                "America/Argentina/Buenos_Aires");
            var localMidnight = DateTime.SpecifyKind(
                date.ToDateTime(TimeOnly.MinValue),
                DateTimeKind.Unspecified);
            return TimeZoneInfo.ConvertTimeToUtc(localMidnight, argentinaTimeZone);
        }
    }
}
