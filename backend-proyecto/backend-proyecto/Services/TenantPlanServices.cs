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
        private readonly IMapper _mapper;

        public TenantPlanServices(ITenantPlanRepository tenantPlanRepository, IMapper mapper)
        {
            _tenantPlanRepository = tenantPlanRepository;
            _mapper = mapper;
        }

        public async Task<List<TenantPlan>> GetAll()
        {
            return await _tenantPlanRepository.GetAllAsync();
        }

        public async Task<TenantPlan> CreateOne(CreateTenantPlanDTO createTenantPlanDTO)
        {
            if(createTenantPlanDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del plan no puede tener mas de 50 caracteres");
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
            return tenantPlan;
        }

        public async Task DeleteOne(int id)
        {
            var tenantPlan = await _tenantPlanRepository.GetOneAsync(p => p.Id == id);
            if(tenantPlan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un plan tenant con el Id = '{id}'");
            }
            await _tenantPlanRepository.DeleteOneAsync(tenantPlan);
        }

        public async Task<TenantPlan> UpdateOne(int id, UpdateTenantPlanDTO updateTenantPlan)
        {
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
            return tenantPlan;
        }
    }
}
