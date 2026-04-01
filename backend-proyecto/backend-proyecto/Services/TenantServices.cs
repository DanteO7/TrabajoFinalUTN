using AutoMapper;
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
        private readonly IMapper _mapper;
        public TenantServices(ITenantRepository tenantRepository, IUserRepository userRepository, ITenantPlanRepository tenantPlanRepository, IMapper mapper)
        {
            _tenantRepository = tenantRepository;
            _userRepository = userRepository;
            _tenantPlanRepository = tenantPlanRepository;
            _mapper = mapper;
        }

        public async Task<List<ResponseTenantDTO>> GetAll()
        {
            var tenants = await _tenantRepository.GetAllAsync(null, t => t.OwnerUser, t => t.TenantPlan);
            return _mapper.Map<List<ResponseTenantDTO>>(tenants);
        }

        public async Task<ResponseTenantDTO> CreateOne(CreateTenantDTO createTenantDTO)
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
            return _mapper.Map<ResponseTenantDTO>(tenant);
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

        public async Task<ResponseTenantDTO> UpdateOne(int id, UpdateTenantDTO updateTenantDTO)
        {
            var tenant = await _tenantRepository.GetOneAsync(
                t => t.Id == id,
                t => t.OwnerUser,
                t => t.TenantPlan
            );

            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{id}'");
            }

            if (updateTenantDTO.Name != null)
            {
                if (updateTenantDTO.Name.Length > 50)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest, "El nombre no puede tener más de 50 caracteres");
                }

                tenant.Name = updateTenantDTO.Name;
            }

            if (updateTenantDTO.IsActive.HasValue)
            {
                if (updateTenantDTO.IsActive == tenant.IsActive)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest, "El estado ya es el mismo");
                }

                tenant.IsActive = updateTenantDTO.IsActive.Value;
            }

            if (updateTenantDTO.TenantPlanId.HasValue)
            {
                var plan = await _tenantPlanRepository.GetOneAsync(p => p.Id == updateTenantDTO.TenantPlanId.Value);

                if (plan == null)
                {
                    throw new HttpResponseError(HttpStatusCode.NotFound, $"No existe plan con Id = '{updateTenantDTO.TenantPlanId}'");
                }

                if (updateTenantDTO.TenantPlanId == tenant.TenantPlanId)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest, "El plan ya es el mismo");
                }

                tenant.TenantPlanId = updateTenantDTO.TenantPlanId.Value;
            }

            if (updateTenantDTO.MonthlyFeeStatus != null)
            {
                if (updateTenantDTO.MonthlyFeeStatus != MonthlyFeeStatus.PAID &&
                    updateTenantDTO.MonthlyFeeStatus != MonthlyFeeStatus.PENDING &&
                    updateTenantDTO.MonthlyFeeStatus != MonthlyFeeStatus.OVERDUE)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest, $"Estado inválido: '{updateTenantDTO.MonthlyFeeStatus}'");
                }

                if (updateTenantDTO.MonthlyFeeStatus == tenant.MonthlyFeeStatus)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest, "El estado ya es el mismo");
                }

                tenant.MonthlyFeeStatus = updateTenantDTO.MonthlyFeeStatus;
            }

            await _tenantRepository.UpdateOneAsync(tenant);

            return _mapper.Map<ResponseTenantDTO>(tenant);
        }
    }
}
