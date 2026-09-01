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
        private readonly IStudentRepository _studentRepository;
        private readonly PermissionServices _permissionServices;

        public StudentPlanServices(IStudentPlanRepository studentPlanRepository, ITenantRepository tenantRepository, IMapper mapper, IStudentRepository studentRepository, PermissionServices permissionServices)
        {
            _studentPlanRepository = studentPlanRepository;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
            _studentRepository = studentRepository;
            _permissionServices = permissionServices;
        }

        public async Task<List<ResponseStudentPlanDTO>> GetAllByTenantId(int tenantId)
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

            var studentPlans = await _studentPlanRepository.GetAllAsync(p => p.TenantId == tenantId);
            return _mapper.Map<List<ResponseStudentPlanDTO>>(studentPlans);
        }

        public async Task<ResponseStudentPlanDTO> CreateOne(CreateStudentPlanDTO createStudentPlanDTO)
        {
            await _permissionServices.CheckPermission(Permissions.STUDENT_PLAN_CREATE);

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
            if(createStudentPlanDTO.ClassesPerMonth <= 0 || createStudentPlanDTO.ClassesPerMonth > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"Las clases por mes no pueden ser menor o igual a 0 o mayor a 50");
            }

            var studentPlan = _mapper.Map<StudentPlan>(createStudentPlanDTO);
            await _studentPlanRepository.CreateOneAsync(studentPlan);
            return _mapper.Map<ResponseStudentPlanDTO>(studentPlan);
        }

        public async Task DeleteOne(int id)
        {
            await _permissionServices.CheckPermission(Permissions.STUDENT_PLAN_DELETE);

            var studentPlan = await _studentPlanRepository.GetOneAsync(p => p.Id == id);
            if(studentPlan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un plan de estudiante con el Id = '{id}'");
            }

            var studentsWithPlan = await _studentRepository.CountAsync(s => s.StudentPlanId == id);
            if (studentsWithPlan > 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    $"No puedes eliminar este plan porque {studentsWithPlan} estudiante(s) lo tienen asignado");
            }

            await _studentPlanRepository.DeleteOneAsync(studentPlan);
        }

        public async Task<ResponseStudentPlanDTO> UpdateOne(int id, UpdateStudentPlanDTO updateStudentPlanDTO)
        {
            await _permissionServices.CheckPermission(Permissions.STUDENT_PLAN_UPDATE);

            var studentPlan = await _studentPlanRepository.GetOneAsync(p => p.Id == id);
            if(studentPlan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un plan de estudiante con el Id = '{id}'");
            }
            if (updateStudentPlanDTO.Price <= 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El precio no puede ser menor o igual a 0");
            }
            if (updateStudentPlanDTO.ClassesPerMonth <= 0 || updateStudentPlanDTO.ClassesPerMonth > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"Las clases por mes no pueden ser menor o igual a 0 o mayor a 50");
            }
            if (updateStudentPlanDTO.Name != null && updateStudentPlanDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del plan no puede tener mas de 50 caracteres");
            }

            _mapper.Map(updateStudentPlanDTO, studentPlan);
            await _studentPlanRepository.UpdateOneAsync(studentPlan);
            return _mapper.Map<ResponseStudentPlanDTO>(studentPlan);
        }
    }
}
