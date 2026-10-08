using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Repositories;
using backend_proyecto.Utils;

namespace backend_proyecto.Services
{
    public class ReservationValidationServices
    {
        private readonly IStudentPlanRepository _studentPlanRepository;
        private readonly IReservationRepository _reservationRepository;

        public ReservationValidationServices(
            IStudentPlanRepository studentPlanRepository,
            IReservationRepository reservationRepository)
        {
            _studentPlanRepository = studentPlanRepository;
            _reservationRepository = reservationRepository;
        }

        public async Task<string?> ValidateStudentForClass(
            Student student,
            Class classEntity,
            IEnumerable<DateOnly>? additionalClassDates = null
        )
        {
            var fullName =
                $"{student.User.Name} {student.User.Surname}";

            var studentPlan =
                await _studentPlanRepository.GetOneAsync(
                    p => p.Id == student.StudentPlanId
                );

            if (studentPlan == null)
            {
                return
                    $"Alumno {fullName}: No tiene plan activo";
            }

            if (
                student.MonthlyFeeStatus ==
                MonthlyFeeStatus.OVERDUE
            )
            {
                return
                    $"Alumno {fullName}: No tiene la cuota al día";
            }

            if (student.PaymentDueDate == null)
            {
                return
                    $"Alumno {fullName}: No tiene un ciclo de clases activo";
            }

            var cycleEnd =
                DateOnly.FromDateTime(
                    student.PaymentDueDate.Value
                );

            var cycleStart =
                DateOnly.FromDateTime(
                    student.PaymentDueDate.Value.AddDays(-30)
                );

            while (classEntity.Date > cycleEnd)
            {
                cycleStart = cycleEnd.AddDays(1);
                cycleEnd = cycleStart.AddDays(30);
            }

            if (classEntity.Date < cycleStart)
            {
                return
                    $"Alumno {fullName}: La clase no pertenece a un ciclo disponible";
            }

            var reservationsInCycle =
                await _reservationRepository.CountAsync(
                    r =>
                        r.StudentId == student.Id &&
                        r.Class.Date >= cycleStart &&
                        r.Class.Date <= cycleEnd
                );

            var additionalReservationsInCycle =
                additionalClassDates?
                    .Count(date =>
                        date >= cycleStart &&
                        date <= cycleEnd
                    ) ?? 0;

            var totalReservations =
                reservationsInCycle +
                additionalReservationsInCycle;

            if (
                totalReservations >=
                studentPlan.ClassesPerMonth
            )
            {
                return
                    $"Alumno {fullName}: Alcanzó el límite de clases de su ciclo";
            }

            return null;
        }
    }
}