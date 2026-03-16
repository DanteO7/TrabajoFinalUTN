using AutoMapper;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using System.Net;

namespace backend_proyecto.Services
{
    public class ReservationServices
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IMapper _mapper;
        private readonly IStudentRepository _studentRepository;
        private readonly IClassRepository _classRepository;
        private readonly IStudentPlanRepository _studentPlanRepository;
        public ReservationServices(IReservationRepository reservationRepository, ITenantRepository tenantRepository, IMapper mapper, IStudentRepository studentRepository, IClassRepository classRepository, IStudentPlanRepository studentPlanRepository)
        {
            _reservationRepository = reservationRepository;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
            _studentRepository = studentRepository;
            _classRepository = classRepository;
            _studentPlanRepository = studentPlanRepository;
        }

        public async Task<List<ResponseReservationDTO>> GetAllByDate(int tenantId, DateTime date)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == tenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{tenantId}'");
            }
            var reservations = await _reservationRepository.GetAllAsync(r => r.TenantId == tenantId && r.ReservationDate.Date == date.Date, r => r.Class, r => r.Student);
            return _mapper.Map<List<ResponseReservationDTO>>(reservations);
        }

        public async Task<List<ResponseReservationDTO>> GetAllByStudent(int studentId)
        {
            var student = await _studentRepository.GetOneAsync(s => s.Id == studentId);
            if (student == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un estudiante con el Id = '{studentId}'");
            }
            var reservations = await _reservationRepository.GetAllAsync(r => r.StudentId == studentId, r => r.Class, r => r.Student);
            return _mapper.Map<List<ResponseReservationDTO>>(reservations);
        }

        public async Task<ResponseReservationDTO> CreateOne(CreateReservationDTO createReservationDTO)
        {
            var student = await _studentRepository.GetOneAsync(s => s.Id == createReservationDTO.StudentId);
            if (student == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un estudiante con el Id = '{createReservationDTO.StudentId}'");
            }

            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == createReservationDTO.TenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{createReservationDTO.TenantId}'");
            }

            var classEntity = await _classRepository.GetOneAsync(c => c.Id == createReservationDTO.ClassId);
            if (classEntity == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una clase con el Id = '{createReservationDTO.ClassId}'");
            }

            if (student.TenantId != createReservationDTO.TenantId)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El estudiante no pertenece al tenant especificado");
            }

            var existingReservation = await _reservationRepository.GetOneAsync(r =>
                r.ClassId == createReservationDTO.ClassId &&
                r.StudentId == createReservationDTO.StudentId);

            if (existingReservation != null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El estudiante ya tiene una reserva para esta clase");
            }

            var reservations = await _reservationRepository.GetAllAsync(r =>r.ClassId == createReservationDTO.ClassId);
            if (reservations.Count() >= classEntity.MaxCapacity)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,$"La clase no tiene cupos disponibles");
            }

            if (createReservationDTO.ReservationDate < DateTime.Now)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"No se puede crear una reserva con fecha pasada");
            }

            var studentPlan = await _studentPlanRepository.GetOneAsync(p => p.Id == student.StudentPlanId);
            if (studentPlan == null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, "El estudiante no tiene un plan activo");
            }

            if(student.MonthlyFeeStatus == MonthlyFeeStatus.OVERDUE)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, "El estudiante no tiene la cuota al día");
            }

            var reservation = _mapper.Map<Reservation>(createReservationDTO);
            reservation.ReservationStatus = ReservationStatus.PENDING;
            await _reservationRepository.CreateOneAsync(reservation);
            return _mapper.Map<ResponseReservationDTO>(reservation);
        }

        public async Task DeleteOne(int id)
        {
            var reservation = await _reservationRepository.GetOneAsync(r => r.Id == id);
            if (reservation == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una reserva con el Id = '{id}'");
            }
            await _reservationRepository.DeleteOneAsync(reservation);
        }

        public async Task<ResponseReservationDTO> ChangeStatus(int id, ChangeStatusReservationDTO changeStatusReservationDTO)
        {
            var reservation = await _reservationRepository.GetOneAsync(r => r.Id == id, r => r.Class, r => r.Student);
            if (reservation == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una reserva con el Id = '{id}'");
            }

            var status = changeStatusReservationDTO.ReservationStatus;
            if (status != ReservationStatus.COMPLETED && status != ReservationStatus.CONFIRMED && status != ReservationStatus.CANCELLED && status != ReservationStatus.PENDING)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"No existe el estado de la reserva con el nombre = '{status}'");
            }

            if (status == reservation.ReservationStatus)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El estado de la reserva no puede ser el mismo = '{status}'");
            }

            reservation.ReservationStatus = status;
            await _reservationRepository.UpdateOneAsync(reservation);
            return _mapper.Map<ResponseReservationDTO>(reservation);
        }
    }
}
