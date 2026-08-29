using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using System.Net;
using AutoMapper;

namespace backend_proyecto.Services
{
    public class TenantPlanServices
    {
        private readonly ITenantPlanRepository _tenantPlanRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IMapper _mapper;
        private readonly IAdminRepository _adminRepository;

        public TenantPlanServices(ITenantPlanRepository tenantPlanRepository, IMapper mapper, ITenantRepository tenantRepository, IAdminRepository adminRepository)
        {
            _tenantPlanRepository = tenantPlanRepository;
            _mapper = mapper;
            _tenantRepository = tenantRepository;
            _adminRepository = adminRepository;
        }

        public async Task<List<ResponseTenantPlanDTO>> GetAll()
        {
            var tenantPlans = await _tenantPlanRepository.GetAllAsync();
            return _mapper.Map<List<ResponseTenantPlanDTO>>(tenantPlans);
        }

        public async Task<ResponseTenantPlanDTO> CreateOne(CreateTenantPlanDTO createTenantPlanDTO, int userId)
        {
            var isAdmin = await _adminRepository.ExistsByUserId(userId);

            if (!isAdmin)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "Solo un administrador puede crear un plan de negocio"
                );
            }

            if (createTenantPlanDTO.Name != null && createTenantPlanDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del plan no puede ser nulo o tener mas de 50 caracteres");
            }
            if (createTenantPlanDTO.Price <= 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El precio no puede ser menor o igual a 0");
            }
            if(createTenantPlanDTO.MaxStudents <= 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El maximo de estudiantes no puede ser menor o igual a 0");
            }
            if (createTenantPlanDTO.MaxProfessors <= 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El maximo de profesores no puede ser menor o igual a 0");
            }
            var tenantPlan = _mapper.Map<TenantPlan>(createTenantPlanDTO);
            await _tenantPlanRepository.CreateOneAsync(tenantPlan);
            return _mapper.Map<ResponseTenantPlanDTO>(tenantPlan);
        }

        public async Task DeleteOne(int id, int userId)
        {
            var isAdmin = await _adminRepository.ExistsByUserId(userId);

            if (!isAdmin)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "Solo un administrador puede eliminar un plan de negocio"
                );
            }
            var tenantPlan = await _tenantPlanRepository.GetOneAsync(p => p.Id == id);
            if(tenantPlan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un plan tenant con el Id = '{id}'");
            }

            var tenantWithPlan = await _tenantRepository.CountAsync(t => t.TenantPlanId == id);
            if (tenantWithPlan > 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    $"No puedes eliminar este plan porque {tenantWithPlan} negocios lo tienen asignado");
            }

            await _tenantPlanRepository.DeleteOneAsync(tenantPlan);
        }

        public async Task<ResponseTenantPlanDTO> UpdateOne(int id, UpdateTenantPlanDTO updateTenantPlan, int userId)
        {
            var isAdmin = await _adminRepository.ExistsByUserId(userId);

            if (!isAdmin)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "Solo un administrador puede actualizar un plan de negocio"
                );
            }

            var tenantPlan = await _tenantPlanRepository.GetOneAsync(p => p.Id == id);
            if (tenantPlan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un plan tenant con el Id = '{id}'");
            }
            if (updateTenantPlan.Price <= 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El precio no puede ser menor o igual a 0");
            }
            if (updateTenantPlan.MaxStudents <= 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El maximo de estudiantes no puede ser menor o igual a 0");
            }
            if (updateTenantPlan.MaxProfessors <= 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El maximo de profesores no puede ser menor o igual a 0");
            }
            if (updateTenantPlan.Name != null && updateTenantPlan.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del plan no puede tener mas de 50 caracteres");
            }

            _mapper.Map(updateTenantPlan, tenantPlan);
            await _tenantPlanRepository.UpdateOneAsync(tenantPlan);
            return _mapper.Map<ResponseTenantPlanDTO>(tenantPlan);
        }
    }
}
