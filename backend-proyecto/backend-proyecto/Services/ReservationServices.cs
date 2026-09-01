using AutoMapper;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services.Observer;
using backend_proyecto.Utils;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using System.Net;

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
        private readonly IWaitlistSubject _waitlistSubject;
        private readonly PermissionServices _permissionServices;

        public ReservationServices(
             IReservationRepository reservationRepository,
             IClassRepository classRepository,
             IStudentRepository studentRepository,
             ITenantRepository tenantRepository,
             IStudentPlanRepository studentPlanRepository,
             IMapper mapper,
             IWaitlistSubject waitlistSubject,
             PermissionServices permissionServices)
        {
            _reservationRepository = reservationRepository;
            _classRepository = classRepository;
            _studentRepository = studentRepository;
            _tenantRepository = tenantRepository;
            _studentPlanRepository = studentPlanRepository;
            _mapper = mapper;
            _waitlistSubject = waitlistSubject; 
            _permissionServices = permissionServices;
        }
        public async Task<List<ResponseReservationDTO>> CreateMultiple(BulkCreateReservationDTO bulkDTO)
        {
            await _permissionServices.CheckPermission(Permissions.RESERVATION_CREATE);

            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == bulkDTO.TenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    $"No se encontró un tenant con el Id = '{bulkDTO.TenantId}'");
            }

            var classEntity = await _classRepository.GetOneAsync(
                c => c.Id == bulkDTO.ClassId,
                c => c.Activity
            );
            if (classEntity == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    $"No se encontró una clase con el Id = '{bulkDTO.ClassId}'");
            }

            // Validar que la clase no sea en el pasado
            var nowLocal = TimeHelper.Now();
            if (classEntity.Date < DateOnly.FromDateTime(nowLocal))
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "No puedes reservar clases pasadas");
            }

            if (classEntity.Date == DateOnly.FromDateTime(nowLocal))
            {
                var classDateTime = classEntity.Date.ToDateTime(classEntity.StartTime);
                if (classDateTime < nowLocal)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest,
                        "No puedes reservar una clase que ya pasó");
                }
            }

            if (bulkDTO.StudentIds == null || bulkDTO.StudentIds.Count == 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "Debe haber al menos un Alumno");
            }

            var reservations = new List<Reservation>();
            var errors = new List<string>();

            foreach (var studentId in bulkDTO.StudentIds)
            {
                var student = await _studentRepository.GetOneAsync(s => s.Id == studentId, s => s.User);
                if (student == null)
                {
                    errors.Add($"Alumno {studentId}: No encontrado");
                    continue;
                }

                if (student.TenantId != bulkDTO.TenantId)
                {
                    errors.Add($"Alumno {student.User.Name} {student.User.Surname}: No pertenece a este tenant");
                    continue;
                }

                // Validar que no haya reserva duplicada
                var existingReservation = await _reservationRepository.GetOneAsync(r =>
                    r.ClassId == bulkDTO.ClassId &&
                    r.StudentId == studentId);

                if (existingReservation != null)
                {
                    errors.Add($"Alumno {student.User.Name} {student.User.Surname}: Ya tiene una reserva en esta clase");
                    continue;
                }

                // Validar capacidad
                var reservationsCount = await _reservationRepository.CountAsync(r =>
                    r.ClassId == bulkDTO.ClassId);

                if (reservationsCount >= classEntity.MaxCapacity)
                {
                    errors.Add($"Alumno {student.User.Name} {student.User.Surname}: La clase está llena");
                    continue;
                }

                // Validar plan
                var studentPlan = await _studentPlanRepository.GetOneAsync(p => p.Id == student.StudentPlanId);
                if (studentPlan == null)
                {
                    errors.Add($"Alumno {student.User.Name} {student.User.Surname}: No tiene plan activo");
                    continue;
                }

                // Validar pago
                if (student.MonthlyFeeStatus == MonthlyFeeStatus.OVERDUE)
                {
                    errors.Add($"Alumno {student.User.Name} {student.User.Surname}: No tiene la cuota al día");
                    continue;
                }

                // Validar límite mensual
                var startOfMonth = new DateTime(classEntity.Date.Year, classEntity.Date.Month, 1);
                var endOfMonth = startOfMonth.AddMonths(1);

                var reservationsThisMonth = await _reservationRepository.CountAsync(r =>
                    r.StudentId == student.Id &&
                    r.Class.Date >= DateOnly.FromDateTime(startOfMonth) &&
                    r.Class.Date < DateOnly.FromDateTime(endOfMonth));

                if (reservationsThisMonth >= studentPlan.ClassesPerMonth)
                {
                    errors.Add($"Alumno {student.User.Name} {student.User.Surname}: Alcanzó el límite de clases del mes");
                    continue;
                }

                // Agregar reserva válida
                reservations.Add(new Reservation
                {
                    ClassId = bulkDTO.ClassId,
                    TenantId = bulkDTO.TenantId,
                    StudentId = studentId,
                    ReservationDate = DateTime.UtcNow,
                    ReservationStatus = ReservationStatus.PENDING
                });
            }

            if (errors.Any())
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    string.Join(" | ", errors));
            }

            if (!reservations.Any())
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "No se pudo agregar ningún alumno");
            }

            foreach (var reservation in reservations)
            {
                await _reservationRepository.CreateOneAsync(reservation);
            }

            return _mapper.Map<List<ResponseReservationDTO>>(reservations);
        }

        private async Task UpdateCompletedReservations()
        {
            var now = TimeHelper.Now();
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
            await _permissionServices.CheckPermission(Permissions.RESERVATION_READ);

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
            await _permissionServices.CheckPermission(Permissions.RESERVATION_READ);

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
            await _permissionServices.CheckPermission(Permissions.RESERVATION_READ);

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
                    "El alumno no tiene una reserva en esta clase");
            }

            return _mapper.Map<ResponseReservationDTO>(reservation);
        }

        public async Task<List<ResponseReservationDTO>> GetByStudentId(int studentId)
        {
            await _permissionServices.CheckPermission(Permissions.RESERVATION_READ);

            await UpdateCompletedReservations();

            var reservations = await _reservationRepository.Query()
                .Where(r => r.StudentId == studentId)
                .Include(r => r.Class).ThenInclude(c => c.Activity)
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
            await _permissionServices.CheckPermission(Permissions.RESERVATION_DELETE);

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

            if (reservation.ReservationStatus == ReservationStatus.COMPLETED)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "No puedes salir de una clase que ya finalizó");
            }

            var now = TimeHelper.Now();

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

            var wasFull =
                await _reservationRepository.CountAsync(
                    r => r.ClassId == reservation.ClassId
                ) >= reservation.Class.MaxCapacity;

            await _reservationRepository.DeleteOneAsync(reservation);

            if (wasFull)
            {
                await _waitlistSubject.Notify(reservation.Class.Id);
            }
        }
    }
}