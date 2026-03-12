using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
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
            return await _tenantRepository.GetAllAsync(null, t => t.OwnerUser, t => t.TenantPlan);
        }

        public async Task<Tenant> CreateOne(CreateTenantDTO createTenantDTO)
        {
            var user = await _userRepository.GetOneAsync(p => p.Id == createTenantDTO.OwnerUserId);
            if(user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No existe Usuario con el Id = '{createTenantDTO.OwnerUserId}'");
            }

            var plan = await _tenantPlanRepository.GetOneAsync(p => p.Id == createTenantDTO.TenantPlanId);
            if(plan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No existe plan de Tenant con el Id = '{createTenantDTO.TenantPlanId}'");
            }

            // falta validar el pago

            var tenant = new Tenant
            {
                OwnerUserId = createTenantDTO.OwnerUserId,
                IsActive = true,
                TenantPlanId = createTenantDTO.TenantPlanId,
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

        public async Task<Tenant> ChangePlan(int id, ChangePlanTenantDTO changePlanTenantDTO)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == id);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No existe Tenant con el Id = '{id}'");
            }

            var plan = await _tenantPlanRepository.GetOneAsync(p => p.Id == changePlanTenantDTO.TenantPlanId);
            if (plan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No existe plan de Tenant con el Id = '{changePlanTenantDTO.TenantPlanId}'");
            }

            if(changePlanTenantDTO.TenantPlanId == tenant.TenantPlanId)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El plan no puede ser el mismo que ya tiene, PlanId = '{changePlanTenantDTO.TenantPlanId}'");
            }

            tenant.TenantPlanId = changePlanTenantDTO.TenantPlanId;
            await _tenantRepository.UpdateOneAsync(tenant);
            return tenant;
        }

        public async Task<Tenant> ChangeActive(int id, ChangeActiveTenantDTO changeStatusTenantDTO)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == id);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No existe Tenant con el Id = '{id}'");
            }

            if (changeStatusTenantDTO.IsActive == tenant.IsActive)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El estadi no puede ser el mismo que ya tiene, estado = '{changeStatusTenantDTO.IsActive}'");
            }

            tenant.IsActive = changeStatusTenantDTO.IsActive;
            await _tenantRepository.UpdateOneAsync(tenant);
            return tenant;
        }

        public async Task<Tenant> ChangeStatus(int id, ChangeStatusTenantDTO changeStatusTenantDTO)
        {
            var status = changeStatusTenantDTO.MonthlyFeeStatus;
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == id);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{id}'");
            }

            if (status != MonthlyFeeStatus.PAID && status != MonthlyFeeStatus.PENDING && status != MonthlyFeeStatus.OVERDUE)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"No existe el estado de la couta del mes con el nombre = '{status}'");
            }

            if (status == tenant.MonthlyFeeStatus)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El estado de la couta del mes no puede ser el mismo = '{status}'");
            }

            tenant.MonthlyFeeStatus = status;
            await _tenantRepository.UpdateOneAsync(tenant);
            return tenant;
        }
    }
}
