using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Net;

namespace backend_proyecto.Services
{
    public class ClassServices
    {
        private readonly IClassRepository _classRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IMapper _mapper;
        private readonly IActivityRepository _activityRepository;
        private readonly IProfessorRepository _professorRepository;
        private readonly IReservationRepository _reservationRepository;
        public ClassServices(IClassRepository classRepository, ITenantRepository tenantRepository, IMapper mapper, IActivityRepository activityRepository, IProfessorRepository professorRepository, IReservationRepository reservationRepository)
        {
            _classRepository = classRepository;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
            _activityRepository = activityRepository;
            _professorRepository = professorRepository;
            _reservationRepository = reservationRepository;
        }

        public async Task<List<ResponseClassDTO>> GetClassesByDate(int tenantId, DateOnly date, int userId)
        {
            var tenant = await _tenantRepository.GetOneAsync(
                t => t.Id == tenantId,
                t => t.Students,
                t => t.Professors 
            );

            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{tenantId}'");
            }

            var hasAccess =
                tenant.OwnerUserId == userId ||
                tenant.Professors.Any(p => p.UserId == userId) ||
                tenant.Students.Any(s => s.UserId == userId);

            if (!hasAccess)
            {
                throw new HttpResponseError(HttpStatusCode.Forbidden, "No tenés acceso a este tenant");
            }

            var classes = await _classRepository.Query()
                .Where(c => c.TenantId == tenantId && c.Date == date)
                .OrderBy(c => c.StartTime)
                .Include(c => c.Activity)
                .Include(c => c.Professor)
                    .ThenInclude(p => p.User)
                .Include(c => c.Reservations)
                .ToListAsync();

            return _mapper.Map<List<ResponseClassDTO>>(classes);
        }

        public async Task<ResponseClassDTO> CreateOne(CreateClassDTO createClassDTO)
        {
            var activity = await _activityRepository.GetOneAsync(a => a.Id == createClassDTO.ActivityId);
            if (activity == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una actividad con el Id = '{createClassDTO.ActivityId}'");
            }

            var professor = await _professorRepository.GetOneAsync(p => p.Id == createClassDTO.ProfessorId);
            if (professor == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un profesor con el Id = '{createClassDTO.ProfessorId}'");
            }

            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == createClassDTO.TenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{createClassDTO.TenantId}'");
            }

            if (createClassDTO.Date < DateOnly.FromDateTime(DateTime.Now))
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"No se puede crear una clase para un dia anterior = '{createClassDTO.Date}'");
            }

            if(createClassDTO.StartTime >= createClassDTO.EndTime)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"La hora de inicio debe ser menor a la hora del fin = Hora inicio: '{createClassDTO.StartTime}', Hora fin: '{createClassDTO.EndTime}'");
            }

            if(createClassDTO.MaxCapacity <= 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"La capacidad máxima no debe ser menor o igual a cero = '{createClassDTO.MaxCapacity}'");
            }

            var conflict = await _classRepository.ExistsScheduleConflict(createClassDTO, null);
            if (conflict)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El profesor ya tiene una clase en ese horario");
            }

            var classMapped = _mapper.Map<Class>(createClassDTO);
            await _classRepository.CreateOneAsync(classMapped);
            
            // Volver a buscar la clase con sus relaciones
            var createdClass = await _classRepository.GetOneAsync(c => c.Id == classMapped.Id, c => c.Activity, c => c.Professor, c => c.Reservations);

            return _mapper.Map<ResponseClassDTO>(classMapped);
        }

        public async Task DeleteOne(int id)
        {
            var classModel = await _classRepository.GetOneAsync(c => c.Id == id);
            if(classModel == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una clase con el Id = '{id}'");
            }
            await _classRepository.DeleteOneAsync(classModel);
        }

        public async Task<ResponseClassDTO> UpdateOne(int id, UpdateClassDTO updateClassDTO)
        {
            var classEntity = await _classRepository.GetOneAsync(c => c.Id == id, c => c.Activity, c => c.Professor, c => c.Reservations);
            if (classEntity == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una clase con el Id = '{id}'");
            }

            if (updateClassDTO.ActivityId != null)
            {
                var activity = await _activityRepository.GetOneAsync(a => a.Id == updateClassDTO.ActivityId);
                if (activity == null)
                {
                    throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una actividad con el Id = '{updateClassDTO.ActivityId}'");
                }
            }

            if (updateClassDTO.ProfessorId != null)
            {
                var professor = await _professorRepository.GetOneAsync(p => p.Id == updateClassDTO.ProfessorId);
                if (professor == null)
                {
                    throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un profesor con el Id = '{updateClassDTO.ProfessorId}'");
                }
            }

            if (updateClassDTO.Date != null)
            {
                if (updateClassDTO.Date < DateOnly.FromDateTime(DateTime.Now))
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest, $"No se puede asignar una clase a un día anterior = '{updateClassDTO.Date}'");
                }
            }

            if (updateClassDTO.StartTime != null && updateClassDTO.EndTime != null)
            {
                if (updateClassDTO.StartTime >= updateClassDTO.EndTime)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest, $"La hora de inicio debe ser menor a la hora de fin");
                }
            }

            if (updateClassDTO.MaxCapacity != null && updateClassDTO.MaxCapacity <= 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"La capacidad máxima no puede ser menor o igual a 0");
            }

            if (updateClassDTO.ProfessorId != null ||
                updateClassDTO.Date != null ||
                updateClassDTO.StartTime != null ||
                updateClassDTO.EndTime != null)
            {
                var dtoForValidation = new CreateClassDTO
                {
                    ProfessorId = updateClassDTO.ProfessorId ?? classEntity.ProfessorId,
                    Date = updateClassDTO.Date ?? classEntity.Date,
                    StartTime = updateClassDTO.StartTime ?? classEntity.StartTime,
                    EndTime = updateClassDTO.EndTime ?? classEntity.EndTime,
                    ActivityId = updateClassDTO.ActivityId ?? classEntity.ActivityId,
                    TenantId = classEntity.TenantId,
                    MaxCapacity = updateClassDTO.MaxCapacity ?? classEntity.MaxCapacity
                };

                var conflict = await _classRepository.ExistsScheduleConflict(dtoForValidation, id);
                if (conflict)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest, $"El profesor ya tiene una clase en ese horario");
                }
            }

            _mapper.Map(updateClassDTO, classEntity);
            await _classRepository.UpdateOneAsync(classEntity);

            classEntity = await _classRepository.Query()
                .Where(c => c.Id == id)
                .Include(c => c.Activity)
                .Include(c => c.Professor)
                    .ThenInclude(p => p.User)
                .Include(c => c.Reservations)
                .FirstOrDefaultAsync();

            return _mapper.Map<ResponseClassDTO>(classEntity);
        }
        public async Task<List<ResponseClassStudentDTO>> GetStudentsByClass(int classId)
        {
            var classEntity = await _classRepository.GetOneAsync(c => c.Id == classId);

            if (classEntity == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró una clase con Id = '{classId}'");
            }

            var reservations = await _reservationRepository.Query()
             .Where(r => r.ClassId == classId)
             .Include(r => r.Student)
                 .ThenInclude(s => s.User)
             .ToListAsync();

            return _mapper.Map<List<ResponseClassStudentDTO>>(reservations);
        }
    }
}
