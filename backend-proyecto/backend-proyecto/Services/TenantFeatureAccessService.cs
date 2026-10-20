using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using System.Net;

namespace backend_proyecto.Services
{
    public class TenantFeatureAccessService
    {
        private readonly ITenantRepository _tenantRepository;
        private readonly CurrentTenantService _currentTenantService;

        public TenantFeatureAccessService(
            ITenantRepository tenantRepository,
            CurrentTenantService currentTenantService)
        {
            _tenantRepository = tenantRepository;
            _currentTenantService = currentTenantService;
        }

        public async Task<int> EnsureExercisesAndRoutinesAccess(int? requestedTenantId = null)
        {
            var tenantId = _currentTenantService.GetRequiredTenantId();

            if (requestedTenantId.HasValue && requestedTenantId.Value != tenantId)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "No tenés acceso a este tenant"
                );
            }

            var tenant = await _tenantRepository.GetOneAsync(
                t => t.Id == tenantId,
                t => t.TenantPlan
            );

            if (tenant?.TenantPlan == null ||
                !tenant.TenantPlan.IncludesExercisesAndRoutines)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "El plan de este negocio no incluye ejercicios y rutinas"
                );
            }

            return tenantId;
        }
    }
}
