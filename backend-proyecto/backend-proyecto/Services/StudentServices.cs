using AutoMapper;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Net;

namespace backend_proyecto.Services
{
    public class StudentServices
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IUserRepository _userRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IStudentPlanRepository _studentPlanRepository;
        private readonly IMapper _mapper;
        private readonly IProfessorRepository _professorRepository; 
        private readonly IReservationRepository _reservationRepository;
        private readonly PermissionServices _permissionServices;
        private readonly GroupServices _groupServices;

        public StudentServices(IStudentRepository studentRepository, IUserRepository userRepository, ITenantRepository tenantRepository, IStudentPlanRepository studentPlanRepository, IMapper mapper, IProfessorRepository professorRepository, IReservationRepository reservationRepository, PermissionServices permissionServices, GroupServices groupServices)
        {
            _studentRepository = studentRepository;
            _userRepository = userRepository;
            _tenantRepository = tenantRepository;
            _studentPlanRepository = studentPlanRepository;
            _mapper = mapper;
            _professorRepository = professorRepository;
            _reservationRepository = reservationRepository;
            _permissionServices = permissionServices;
            _groupServices = groupServices;
        }

        public async Task<ResponseStudentDTO> AssignOne(AssignStudentDTO assignStudentDTO)
        {
            var user = await _userRepository.GetOneAsync(u => u.Id == assignStudentDTO.UserId);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{assignStudentDTO.UserId}'");
            }

            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == assignStudentDTO.TenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{assignStudentDTO.TenantId}'");
            }

            var studentPlan = await _studentPlanRepository.GetOneAsync(s => s.Id == assignStudentDTO.StudentPlanId);
            if (studentPlan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un plan de alumno con el Id = '{assignStudentDTO.StudentPlanId}'");
            }

            var existingStudent = await _studentRepository.GetOneAsync(
                s => s.UserId == assignStudentDTO.UserId &&
                     s.TenantId == assignStudentDTO.TenantId
            );

            if (existingStudent != null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El usuario ya está asignado como alumno a este negocio.");
            }

            var existingProfessor = await _professorRepository.GetOneAsync(
                p => p.UserId == assignStudentDTO.UserId &&
                     p.TenantId == assignStudentDTO.TenantId
            );

            if (existingProfessor != null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El usuario ya está asignado como profesor a este negocio.");
            }

            if (tenant.OwnerUserId == assignStudentDTO.UserId)
            {
                throw new HttpResponseError( HttpStatusCode.BadRequest,$"El usuario ya es el administrador de este negocio.");
            }

            var student = _mapper.Map<Student>(assignStudentDTO);
            student.MonthlyFeeStatus = MonthlyFeeStatus.PENDING;

            await _studentRepository.CreateOneAsync(student);

            await _groupServices.AssignUserToGroupIfNotExists(
                assignStudentDTO.UserId,
                assignStudentDTO.TenantId,
                "STUDENT"
            );

            return _mapper.Map<ResponseStudentDTO>(student);
        }

        public async Task<List<ResponseStudentDTO>> GetAll(int? tenantId, int? classId, int userId, string? search)
        {
            await _permissionServices.CheckPermission(Permissions.STUDENT_READ);

            var tenant = await _tenantRepository.GetOneAsync(
                t => t.Id == tenantId,
                t => t.Students,
                t => t.Professors
            );

            if (tenantId != null && tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    $"No se encontró un tenant con el Id = '{tenantId}'");
            }

            IQueryable<Student> query = _studentRepository.Query()
                .Include(s => s.StudentPlan)
                .Include(s => s.User);

            if (tenantId != null)
            {
                query = query.Where(s => s.TenantId == tenantId);
            }

            if (tenant != null)
            {
                var hasAccess =
                   tenant.OwnerUserId == userId ||
                   tenant.Professors.Any(p => p.UserId == userId) ||
                   tenant.Students.Any(s => s.UserId == userId);

                if (!hasAccess)
                {
                    throw new HttpResponseError(HttpStatusCode.Forbidden,
                        "No tenés acceso a este tenant");
                }
            }

            if (classId.HasValue)
            {
                var enrolledStudentIds = await _reservationRepository.Query()
                    .Where(r => r.ClassId == classId)
                    .Select(r => r.StudentId)
                    .ToListAsync();

                query = query.Where(s => !enrolledStudentIds.Contains(s.Id));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(s =>
                    s.User.Name.ToLower().Contains(searchLower) ||
                    s.User.Surname.ToLower().Contains(searchLower) ||
                    s.User.Email.ToLower().Contains(searchLower));
            }

            var students = await query.ToListAsync();
            return _mapper.Map<List<ResponseStudentDTO>>(students);
        }

        public async Task<ResponseStudentDTO> GetOneById(int id)
        {
            await _permissionServices.CheckPermission(Permissions.STUDENT_READ);

            var student = await _studentRepository.GetOneAsync(s => s.Id == id, s => s.StudentPlan, s => s.User);
            if (student == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un estudiante con el Id = '{id}'");
            }
            return _mapper.Map<ResponseStudentDTO>(student);
        }

        public async Task DeleteOne(int id)
        {
            await _permissionServices.CheckPermission(Permissions.STUDENT_DELETE);

            var student = await _studentRepository.GetOneAsync(s => s.Id == id);
            if (student == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un estudiante con el Id = '{id}'");
            }
            await _studentRepository.DeleteOneAsync(student);
        }
        public async Task<ResponseStudentDTO> UpdateOne(int id, UpdateStudentDTO updateStudentDTO)
        {
            await _permissionServices.CheckPermission(Permissions.STUDENT_UPDATE);

            var studentPlanId = updateStudentDTO.StudentPlanId;
            var status = updateStudentDTO.MonthlyFeeStatus;

            var student = await _studentRepository.GetOneAsync(s => s.Id == id, s => s.StudentPlan, s => s.User);
            if (student == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un estudiante con el Id = '{id}'");
            }

            var studentPlan = await _studentPlanRepository.GetOneAsync(s => s.Id == studentPlanId);
            if (studentPlan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un plan de alumno con el Id = '{studentPlanId}'");
            }

            if (status != MonthlyFeeStatus.PAID && status != MonthlyFeeStatus.PENDING && status != MonthlyFeeStatus.OVERDUE)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"No existe el estado de la couta del mes con el nombre = '{status}'");
            }

            _mapper.Map(updateStudentDTO, student);

            await _studentRepository.UpdateOneAsync(student);
            return _mapper.Map<ResponseStudentDTO>(student);
        }
        public async Task<ResponseStudentDTO> GetByUserAndTenant(int userId, int tenantId)
        {
            var student = await _studentRepository.GetOneAsync(
                s => s.UserId == userId && s.TenantId == tenantId,
                s => s.User,
                s => s.StudentPlan
            );

            if (student == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    "No existe un registro de alumno para este usuario en este tenant");
            }

            return _mapper.Map<ResponseStudentDTO>(student);
        }
    }
}
