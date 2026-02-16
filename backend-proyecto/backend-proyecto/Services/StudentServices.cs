using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using System.Net;

namespace backend_proyecto.Services
{
    public class StudentServices
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IUserRepository _userRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IStudentPlanRepository _studentPlanRepository;
        public StudentServices(IStudentRepository studentRepository, IUserRepository userRepository, ITenantRepository tenantRepository, IStudentPlanRepository studentPlanRepository)
        {
            _studentRepository = studentRepository;
            _userRepository = userRepository;
            _tenantRepository = tenantRepository;
            _studentPlanRepository = studentPlanRepository;
        }

        public async Task<Student> AssignOne(int userId, int tenantId, int studentPlanId)
        {
            var user = await _userRepository.GetOneAsync(u => u.Id == userId);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{userId}'");
            }

            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == tenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{tenantId}'");
            }

            var studentPlan = await _studentPlanRepository.GetOneAsync(s => s.Id == studentPlanId);
            if (studentPlan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un plan de alumno con el Id = '{studentPlanId}'");
            }

            var student = new Student
            {
                UserId = userId,
                User = user,
                TenantId = tenantId,
                Tenant = tenant,
                StudentPlanId = studentPlanId,
                StudentPlan = studentPlan,
                MonthlyFeeStatus = MonthlyFeeStatus.PENDING
            };

            await _studentRepository.CreateOneAsync(student);
            return student;
        }

        public async Task<List<Student>> GetAllByTenantId(int tenantId)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == tenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{tenantId}'");
            }

            return await _studentRepository.GetAllAsync(s => s.TenantId == tenantId);
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

        public async Task<Student> ChangePlan(int id, int studentPlanId)
        {
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

        public async Task<Student> ChangeStatus(int id, string status)
        {
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
