using AutoMapper;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using System.Net;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace backend_proyecto.Services
{
    public class ReservationServices
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IMapper _mapper;
        private readonly IStudentRepository _studentRepository;
        public ReservationServices(IReservationRepository reservationRepository, ITenantRepository tenantRepository, IMapper mapper, IStudentRepository studentRepository)
        {
            _reservationRepository = reservationRepository;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
            _studentRepository = studentRepository;
        }

        public async Task<List<Reservation>> GetAllByDate(int tenantId, DateTime date)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == tenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{tenantId}'");
            }
            return await _reservationRepository.GetAllAsync(r => r.TenantId == tenantId && r.ReservationDate.Date == date.Date);
        }

        public async Task<List<Reservation>> GetAllByStudent(int studentId)
        {
            var student = await _studentRepository.GetOneAsync(s => s.Id == studentId);
            if (student == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un estudiante con el Id = '{studentId}'");
            }
            return await _reservationRepository.GetAllAsync(r => r.StudentId == studentId);
        }

        public async Task<Reservation> CreateOne(CreateReservationDTO createReservationDTO)
        {
            var reservation = _mapper.Map<Reservation>(createReservationDTO);
            await _reservationRepository.CreateOneAsync(reservation);
            return reservation;
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

        public async Task<Reservation> ChangeStatus(int id, ChangeStatusReservationDTO changeStatusReservationDTO)
        {
            var reservation = await _reservationRepository.GetOneAsync(r => r.Id == id);
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
            return reservation;
        }
    }
}
