using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using System.Net;

namespace backend_proyecto.Services
{
    public class StudentPlanServices
    {
        private readonly IStudentPlanRepository _studentPlanRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IMapper _mapper;

        public StudentPlanServices(IStudentPlanRepository studentPlanRepository, ITenantRepository tenantRepository, IMapper mapper)
        {
            _studentPlanRepository = studentPlanRepository;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
        }

        public async Task<List<StudentPlan>> GetAllByTenantId(int tenantId)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == tenantId);
            if(tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{tenantId}'");
            }
            return await _studentPlanRepository.GetAllAsync(p => p.TenantId == tenantId);
        }

        public async Task<StudentPlan> CreateOne(CreateStudentPlanDTO createStudentPlanDTO)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == createStudentPlanDTO.TenantId);
            if(tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{createStudentPlanDTO.TenantId}'");
            }
            if (createStudentPlanDTO.Name != null && createStudentPlanDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del plan no puede ser nulo o tener mas de 50 caracteres");
            }
            if (createStudentPlanDTO.Price <= 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El precio no puede ser menor o igual a 0");
            }
            if(createStudentPlanDTO.ClassesPerMonth <= 0 || createStudentPlanDTO.ClassesPerMonth > 23)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"Las clases por mes no pueden ser menor o igual a 0 o mayor a 23");
            }

            var studentPlan = _mapper.Map<StudentPlan>(createStudentPlanDTO);
            await _studentPlanRepository.CreateOneAsync(studentPlan);
            return studentPlan;
        }

        public async Task DeleteOne(int id)
        {
            var studentPlan = await _studentPlanRepository.GetOneAsync(p => p.Id == id);
            if(studentPlan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un plan de estudiante con el Id = '{id}'");
            }

            await _studentPlanRepository.DeleteOneAsync(studentPlan);
        }

        public async Task<StudentPlan> UpdateOne(int id, UpdateStudentPlanDTO updateStudentPlanDTO)
        {
            var studentPlan = await _studentPlanRepository.GetOneAsync(p => p.Id == id);
            if(studentPlan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un plan de estudiante con el Id = '{id}'");
            }
            if (updateStudentPlanDTO.Price <= 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El precio no puede ser menor o igual a 0");
            }
            if (updateStudentPlanDTO.ClassesPerMonth <= 0 || updateStudentPlanDTO.ClassesPerMonth > 23)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"Las clases por mes no pueden ser menor o igual a 0 o mayor a 23");
            }
            if (updateStudentPlanDTO.Name != null && updateStudentPlanDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del plan no puede tener mas de 50 caracteres");
            }

            _mapper.Map(updateStudentPlanDTO, studentPlan);
            await _studentPlanRepository.UpdateOneAsync(studentPlan);
            return studentPlan;
        }
    }
}
