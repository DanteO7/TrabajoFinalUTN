using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using System.Net;

namespace backend_proyecto.Services
{
    public class TenantServices
    {
        private readonly ITenantRepository _tenantRepository;
        private readonly IUserRepository _userRepository;
        private readonly ITenantPlanRepository _tenantPlanRepository;
        public TenantServices(ITenantRepository tenantRepository, IUserRepository userRepository, ITenantPlanRepository tenantPlanRepository)
        {
            _tenantRepository = tenantRepository;
            _userRepository = userRepository;
            _tenantPlanRepository = tenantPlanRepository;
        }

        public async Task<List<Tenant>> GetAll()
        {
            return await _tenantRepository.GetAllAsync();
        }

        public async Task<Tenant> CreateOne(int userId, int tenantPlanId)
        {
            var user = await _userRepository.GetOneAsync(p => p.Id == userId);
            if(user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No existe Usuario con el Id = '{userId}'");
            }

            var plan = await _tenantPlanRepository.GetOneAsync(p => p.Id == tenantPlanId);
            if(plan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No existe plan de Tenant con el Id = '{tenantPlanId}'");
            }

            // falta validar el pago

            var tenant = new Tenant
            {
                OwnerUserId = userId,
                IsActive = true,
                TenantPlanId = tenantPlanId,
                MonthlyFeeStatus = MonthlyFeeStatus.PAID,
            };

            await _tenantRepository.CreateOneAsync(tenant);
            return tenant;
        }

        public async Task DeleteOne(int id)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == id);
            if(tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No existe Tenant con el Id = '{id}'");
            }
            await _tenantRepository.DeleteOneAsync(tenant);
        }

        public async Task<Tenant> ChangePlan(int id, int tenantPlanId)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == id);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No existe Tenant con el Id = '{id}'");
            }

            var plan = await _tenantPlanRepository.GetOneAsync(p => p.Id == tenantPlanId);
            if (plan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No existe plan de Tenant con el Id = '{tenantPlanId}'");
            }

            if(tenantPlanId == tenant.TenantPlanId)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El plan no puede ser el mismo que ya tiene, PlanId = '{tenantPlanId}'");
            }

            tenant.TenantPlanId = tenantPlanId;
            await _tenantRepository.UpdateOneAsync(tenant);
            return tenant;
        }
    }
}
