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

        public async Task<TenantPlan> CreateOne(string name, decimal price, int maxStudents, int maxProfessor)
        {
            var tenantPlan = new TenantPlan
            {
                Name = name,
                Price = price,
                MaxStudents = maxStudents,
                MaxProfessors = maxProfessor
            };
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

            _mapper.Map(updateTenantPlan, tenantPlan);
            await _tenantPlanRepository.UpdateOneAsync(tenantPlan);
            return tenantPlan;
        }
    }
}
