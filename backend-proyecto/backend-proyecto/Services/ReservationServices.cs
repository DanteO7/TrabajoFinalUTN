using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using AutoMapper;
using System.Net;
using Microsoft.EntityFrameworkCore;
using backend_proyecto.Enums;

namespace backend_proyecto.Services
{
    public class ReservationServices
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly IClassRepository _classRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IStudentPlanRepository _studentPlanRepository;
        private readonly IMapper _mapper;

        public ReservationServices(
            IReservationRepository reservationRepository,
            IClassRepository classRepository,
            IStudentRepository studentRepository,
            ITenantRepository tenantRepository,
            IStudentPlanRepository studentPlanRepository,
            IMapper mapper)
        {
            _reservationRepository = reservationRepository;
            _classRepository = classRepository;
            _studentRepository = studentRepository;
            _tenantRepository = tenantRepository;
            _studentPlanRepository = studentPlanRepository;
            _mapper = mapper;
        }

        public async Task<ResponseReservationDTO> CreateOne(CreateReservationDTO createReservationDTO)
        {
            // Validar existencia de entidades
            var student = await _studentRepository.GetOneAsync(s => s.Id == createReservationDTO.StudentId);
            if (student == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    $"No se encontró un estudiante con el Id = '{createReservationDTO.StudentId}'");
            }

            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == createReservationDTO.TenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    $"No se encontró un tenant con el Id = '{createReservationDTO.TenantId}'");
            }

            var classEntity = await _classRepository.GetOneAsync(
                c => c.Id == createReservationDTO.ClassId,
                c => c.Activity
            );
            if (classEntity == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    $"No se encontró una clase con el Id = '{createReservationDTO.ClassId}'");
            }

            // Validar que el estudiante pertenezca al tenant
            if (student.TenantId != createReservationDTO.TenantId)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "El estudiante no pertenece al tenant especificado");
            }

            // Validar que la clase no sea en el pasado
            var nowLocal = DateTime.Now;
            var classDate = classEntity.Date;
            var classTime = classEntity.StartTime;

            if (classDate < DateOnly.FromDateTime(nowLocal))
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "No puedes reservar clases pasadas");
            }

            // Si la clase es hoy, verificar que no haya pasado
            if (classDate == DateOnly.FromDateTime(nowLocal))
            {
                var classDateTime = classDate.ToDateTime(classTime);
                if (classDateTime < nowLocal)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest,
                        "No puedes reservar una clase que ya pasó");
                }
            }

            // Validar que no haya reserva duplicada
            var existingReservation = await _reservationRepository.GetOneAsync(r =>
                r.ClassId == createReservationDTO.ClassId &&
                r.StudentId == createReservationDTO.StudentId);

            if (existingReservation != null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "El estudiante ya tiene una reserva activa para esta clase");
            }

            // Validar capacidad de la clase
            var reservationsCount = await _reservationRepository.CountAsync(r =>
                r.ClassId == createReservationDTO.ClassId);

            if (reservationsCount >= classEntity.MaxCapacity)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "La clase no tiene cupos disponibles");
            }

            // Validar plan del estudiante
            var studentPlan = await _studentPlanRepository.GetOneAsync(p => p.Id == student.StudentPlanId);
            if (studentPlan == null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "El estudiante no tiene un plan activo");
            }

            // Validar estado de pago
            if (student.MonthlyFeeStatus == MonthlyFeeStatus.OVERDUE)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "El estudiante no tiene la cuota al día");
            }

            // Validar límite de clases del mes
            var startOfMonth = new DateTime(classDate.Year, classDate.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1);

            var reservationsThisMonth = await _reservationRepository.CountAsync(r =>
                r.StudentId == student.Id &&
                r.Class.Date >= DateOnly.FromDateTime(startOfMonth) &&
                r.Class.Date < DateOnly.FromDateTime(endOfMonth));

            if (reservationsThisMonth >= studentPlan.ClassesPerMonth)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "Ya alcanzaste el límite de clases de tu plan para este mes");
            }

            // Crear reserva
            var reservation = new Reservation
            {
                ClassId = createReservationDTO.ClassId,
                TenantId = createReservationDTO.TenantId,
                StudentId = createReservationDTO.StudentId,
                ReservationDate = DateTime.UtcNow,
                ReservationStatus = ReservationStatus.PENDING
            };

            await _reservationRepository.CreateOneAsync(reservation);
            return _mapper.Map<ResponseReservationDTO>(reservation);
        }

        public async Task UpdateCompletedReservations()
        {
            var now = DateTime.Now;
            var today = DateOnly.FromDateTime(now);
            var currentTime = TimeOnly.FromDateTime(now);

            var reservations = await _reservationRepository.Query()
                .Include(r => r.Class)
                .Where(r =>
                    r.ReservationStatus != ReservationStatus.COMPLETED &&
                    (
                        r.Class.Date < today ||
                        (
                            r.Class.Date == today &&
                            r.Class.StartTime <= currentTime
                        )
                    )
                )
                .ToListAsync();

            foreach (var reservation in reservations)
            {
                reservation.ReservationStatus = ReservationStatus.COMPLETED;
            }

            if (reservations.Any())
            {
                await _reservationRepository.UpdateRangeAsync(reservations);
            }
        }

        public async Task<ResponseReservationDTO> GetById(int id)
        {
            await UpdateCompletedReservations();

            var reservation = await _reservationRepository.GetOneAsync(
                r => r.Id == id,
                r => r.Class,
                r => r.Student,
                r => r.Tenant
            );

            if (reservation == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    $"No se encontró una reserva con el Id = '{id}'");
            }

            return _mapper.Map<ResponseReservationDTO>(reservation);
        }

        public async Task<List<ResponseReservationDTO>> GetByClassId(int classId)
        {
            await UpdateCompletedReservations();

            var reservations = await _reservationRepository.Query()
                .Where(r => r.ClassId == classId)
                .Include(r => r.Class)
                .Include(r => r.Student)
                .Include(r => r.Tenant)
                .ToListAsync();

            return _mapper.Map<List<ResponseReservationDTO>>(reservations);
        }

        public async Task<ResponseReservationDTO> GetByClassAndStudent(int classId, int studentId)
        {
            await UpdateCompletedReservations();

            var reservation = await _reservationRepository.GetOneAsync(
                r => r.ClassId == classId && r.StudentId == studentId,
                r => r.Class,
                r => r.Student,
                r => r.Tenant
            );

            if (reservation == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    "El estudiante no tiene una reserva en esta clase");
            }

            return _mapper.Map<ResponseReservationDTO>(reservation);
        }

        public async Task<List<ResponseReservationDTO>> GetByStudentId(int studentId)
        {
            await UpdateCompletedReservations();

            var reservations = await _reservationRepository.Query()
                .Where(r => r.StudentId == studentId).Include(r => r.Class).ThenInclude(c => c.Activity)
                .Include(r => r.Class)
                    .ThenInclude(c => c.Professor)
                        .ThenInclude(p => p.User)
                .Include(r => r.Student)
                .Include(r => r.Tenant)
                .ToListAsync();

            return _mapper.Map<List<ResponseReservationDTO>>(reservations);
        }

        public async Task DeleteOne(int id)
        {
            var reservation = await _reservationRepository.GetOneAsync(
                    r => r.Id == id,
                    r => r.Class
                );

            if (reservation == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    $"No se encontró una reserva con el Id = '{id}'");
            }

            if (reservation.ReservationStatus == ReservationStatus.COMPLETED)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "No puedes salir de una clase que ya finalizó");
            }

            var now = DateTime.Now;

            var limit = reservation.Class.Date
                .ToDateTime(reservation.Class.StartTime)
                .AddMinutes(-20);

            if (now >= limit)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No podés cancelar una reserva menos de 20 minutos antes del inicio de la clase."
                );
            }

            await _reservationRepository.DeleteOneAsync(reservation);
        }
    }
}