using backend_proyecto.Config;
using Microsoft.Extensions.Options;

namespace backend_proyecto.Services
{
    public class FrontendUrlBuilder
    {
        private readonly string _baseUrl;

        public FrontendUrlBuilder(IOptions<FrontendOptions> options)
        {
            _baseUrl = (options.Value.BaseUrl ?? string.Empty).TrimEnd('/');
        }

        public string Build(string path)
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return _baseUrl;
            }

            return $"{_baseUrl}/{path.TrimStart('/')}";
        }

        public string BuildInvitation(Guid token)
        {
            return Build($"invitacion/{token}");
        }

        public string BuildPasswordReset(string token)
        {
            return Build($"resetear-contraseña?token={Uri.EscapeDataString(token)}");
        }

        public string BuildTenantCreationReview(string token)
        {
            return Build($"crear-negocio?token={Uri.EscapeDataString(token)}");
        }
    }
}
