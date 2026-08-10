using AutoMapper;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace backend_proyecto.Services
{
    public class WaitlistServices
    {
        private readonly IWaitlistRepository _waitlistRepository;
        private readonly IClassRepository _classRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IMapper _mapper;

        public WaitlistServices(
            IWaitlistRepository waitlistRepository,
            IClassRepository classRepository,
            IStudentRepository studentRepository,
            IMapper mapper)
        {
            _waitlistRepository = waitlistRepository;
            _classRepository = classRepository;
            _studentRepository = studentRepository;
            _mapper = mapper;
        }

        public async Task<ResponseWaitlistDTO> CreateOne(
    CreateWaitlistDTO createWaitlistDTO)
        {
            var classEntity = await _classRepository.GetOneAsync(
                c => c.Id == createWaitlistDTO.ClassId,
                c => c.Reservations
            );

            if (classEntity == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró una clase con el Id = '{createWaitlistDTO.ClassId}'"
                );
            }

            var student = await _studentRepository.GetOneAsync(
                s => s.Id == createWaitlistDTO.StudentId
            );

            if (student == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un estudiante con el Id = '{createWaitlistDTO.StudentId}'"
                );
            }

            // El alumno debe pertenecer al mismo tenant que la clase
            if (student.TenantId != classEntity.TenantId)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El estudiante no pertenece al tenant de la clase"
                );
            }

            // La clase debe ser futura
            var classStart = classEntity.Date.ToDateTime(
                classEntity.StartTime
            );

            if (classStart <= Utils.TimeHelper.Now())
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No podés ingresar a la lista de espera de una clase que ya comenzó"
                );
            }

            // Solo se puede entrar a la lista de espera si está llena
            if (classEntity.Reservations.Count < classEntity.MaxCapacity)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La clase todavía tiene cupos disponibles"
                );
            }

            // Evitar duplicados
            var existingWaitlist = await _waitlistRepository.GetOneAsync(
                w =>
                    w.ClassId == createWaitlistDTO.ClassId &&
                    w.StudentId == createWaitlistDTO.StudentId
            );

            if (existingWaitlist != null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El estudiante ya está en la lista de espera de esta clase"
                );
            }

            var waitlist = new Waitlist
            {
                ClassId = createWaitlistDTO.ClassId,
                StudentId = createWaitlistDTO.StudentId,
                CreatedAt = DateTime.UtcNow
            };

            await _waitlistRepository.CreateOneAsync(waitlist);

            return _mapper.Map<ResponseWaitlistDTO>(waitlist);
        }

        public async Task DeleteOne(int id)
        {
            var waitlist = await _waitlistRepository.GetOneAsync(
                w => w.Id == id
            );

            if (waitlist == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró una entrada en la lista de espera con el Id = '{id}'"
                );
            }

            await _waitlistRepository.DeleteOneAsync(waitlist);
        }

        public async Task<List<ResponseWaitlistDTO>> GetByStudentId(int studentId)
        {
            var student = await _studentRepository.GetOneAsync(
                s => s.Id == studentId
            );

            if (student == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un estudiante con el Id = '{studentId}'"
                );
            }

            var waitlists = await _waitlistRepository.Query()
                .Where(w => w.StudentId == studentId)
                .Include(w => w.Class)
                    .ThenInclude(c => c.Activity)
                .OrderBy(w => w.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<ResponseWaitlistDTO>>(waitlists);
        }
    }
}