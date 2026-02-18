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
    public class StudentServices
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IUserRepository _userRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IStudentPlanRepository _studentPlanRepository;
        private readonly IMapper _mapper;
        public StudentServices(IStudentRepository studentRepository, IUserRepository userRepository, ITenantRepository tenantRepository, IStudentPlanRepository studentPlanRepository, IMapper mapper)
        {
            _studentRepository = studentRepository;
            _userRepository = userRepository;
            _tenantRepository = tenantRepository;
            _studentPlanRepository = studentPlanRepository;
            _mapper = mapper;
        }

        public async Task<Student> AssignOne(AssignStudentDTO assignStudentDTO)
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

            var existingStudent = await _studentRepository.GetOneAsync(s => s.UserId == assignStudentDTO.UserId && s.TenantId == assignStudentDTO.TenantId);
            if (existingStudent != null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El usuario '{existingStudent.UserId}' ya está asignado a este tenant = '{assignStudentDTO.TenantId}'");
            }

            var student = _mapper.Map<Student>(assignStudentDTO);
            student.MonthlyFeeStatus = MonthlyFeeStatus.PENDING;

            await _studentRepository.CreateOneAsync(student);
            return student;
        }

        public async Task<List<Student>> GetAll(int? tenantId)
        {
            IQueryable<Student> query = _studentRepository.Query();

            if(tenantId != null)
            {
                query = query.Where(s => s.TenantId == tenantId);
            }
            var students = await query.ToListAsync();
            return students;
        }

        public async Task<Student> GetOneById(int id)
        {
            var student = await _studentRepository.GetOneAsync(s => s.UserId == id);
            if (student == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }

            return student;
        }

        public async Task DeleteOne(int id)
        {
            var student = await _studentRepository.GetOneAsync(s => s.UserId == id);
            if (student == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }
            await _studentRepository.DeleteOneAsync(student);
        }

        public async Task<Student> ChangePlan(int id, ChangePlanStudentDTO changePlanStudentDTO)
        {
            var studentPlanId = changePlanStudentDTO.StudentPlanId;
            var student = await _studentRepository.GetOneAsync(s => s.UserId == id);
            if (student == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }

            var studentPlan = await _studentPlanRepository.GetOneAsync(s => s.Id == studentPlanId);
            if (studentPlan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un plan de alumno con el Id = '{studentPlanId}'");
            }

            if (studentPlanId == student.StudentPlanId)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El plan no puede ser el mismo que ya tiene, PlanId = '{studentPlanId}'");
            }

            student.StudentPlanId = studentPlanId;
            student.StudentPlan = studentPlan;

            await _studentRepository.UpdateOneAsync(student);
            return student;
        }

        public async Task<Student> ChangeStatus(int id, ChangeStatusStudentDTO changeStatusStudentDTO)
        {
            var status = changeStatusStudentDTO.MonthlyFeeStatus;
            var student = await _studentRepository.GetOneAsync(s => s.UserId == id);
            if (student == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }

            if(status != MonthlyFeeStatus.PAID && status != MonthlyFeeStatus.PENDING && status != MonthlyFeeStatus.OVERDUE)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"No existe el estado de la couta del mes con el nombre = '{status}'");
            }

            if(status == student.MonthlyFeeStatus)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El estado de la couta del mes no puede ser el mismo = '{status}'");
            }

            student.MonthlyFeeStatus = status;
            await _studentRepository.UpdateOneAsync(student);
            return student;
        }
    }
}
