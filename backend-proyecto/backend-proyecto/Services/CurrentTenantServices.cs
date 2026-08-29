using backend_proyecto.Utils.Errors;
using System.Net;

namespace backend_proyecto.Services
{
    public class CurrentTenantService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentTenantService(
            IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public int? TenantId
        {
            get
            {
                var context = _httpContextAccessor.HttpContext;

                if (context == null)
                    return null;

                if (!context.Request.Headers.TryGetValue(
                    "X-Tenant-Id",
                    out var value))
                {
                    return null;
                }

                return int.TryParse(value, out var tenantId)
                    ? tenantId
                    : null;
            }
        }

        public int GetRequiredTenantId()
        {
            var tenantId = TenantId;

            if (!tenantId.HasValue)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No se especificó un tenant"
                );
            }

            return tenantId.Value;
        }
    }
}