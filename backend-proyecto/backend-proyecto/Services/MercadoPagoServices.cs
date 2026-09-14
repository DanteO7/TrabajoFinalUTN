using backend_proyecto.Config;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend_proyecto.Services
{
    public class MercadoPagoServices
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ITenantRepository _tenantRepository;
        private readonly MercadoPagoSettings _settings;
        private readonly IDataProtector _protector;

        public MercadoPagoServices(
            IHttpClientFactory httpClientFactory,
            ITenantRepository tenantRepository,
            IOptions<MercadoPagoSettings> settings,
            IDataProtectionProvider dataProtectionProvider)
        {
            _httpClientFactory = httpClientFactory;
            _tenantRepository = tenantRepository;
            _settings = settings.Value;

            _protector = dataProtectionProvider.CreateProtector(
                "TurnoFacil.MercadoPago"
            );
        }

        public async Task<string> GetAuthorizationUrl(
            int tenantId,
            int userId)
        {
            var tenant =
                await _tenantRepository.GetOneAsync(
                    t => t.Id == tenantId
                );

            if (tenant == null)
            {
                throw new InvalidOperationException(
                    "No se encontró el gimnasio."
                );
            }

            if (tenant.OwnerUserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "No tenés permisos para conectar Mercado Pago de este gimnasio."
                );
            }

            var codeVerifier = GenerateCodeVerifier();
            var codeChallenge = GenerateCodeChallenge(codeVerifier);

            var stateData = new MercadoPagoState
            {
                TenantId = tenantId,
                CodeVerifier = codeVerifier,
                Nonce = Guid.NewGuid().ToString("N")
            };

            var stateJson =
                JsonSerializer.Serialize(stateData);

            var state =
                _protector.Protect(stateJson);

            var url =
                "https://auth.mercadopago.com.ar/authorization" +
                $"?client_id={Uri.EscapeDataString(_settings.ClientId)}" +
                "&response_type=code" +
                "&platform_id=mp" +
                "&scope=offline_access%20write" +
                $"&state={Uri.EscapeDataString(state)}" +
                $"&redirect_uri={Uri.EscapeDataString(_settings.RedirectUri)}" +
                $"&code_challenge={Uri.EscapeDataString(codeChallenge)}" +
                "&code_challenge_method=S256";

            return url;
        }

        public async Task<int> ConnectTenant(
            string code,
            string state)
        {
            MercadoPagoState stateData;

            try
            {
                var stateJson = _protector.Unprotect(state);

                stateData =
                    JsonSerializer.Deserialize<MercadoPagoState>(
                        stateJson
                    ) ?? throw new Exception();
            }
            catch
            {
                throw new InvalidOperationException(
                    "El estado de autorización de Mercado Pago no es válido."
                );
            }

            var tenant =
                await _tenantRepository.GetOneAsync(
                    t => t.Id == stateData.TenantId
                );

            if (tenant == null)
            {
                throw new InvalidOperationException(
                    "No se encontró el gimnasio."
                );
            }

            var client =
                _httpClientFactory.CreateClient();

            var request =
                new HttpRequestMessage(
                    HttpMethod.Post,
                    "https://api.mercadopago.com/oauth/token"
                );

            request.Content =
                new FormUrlEncodedContent(
                    new Dictionary<string, string>
                    {
                        ["client_id"] = _settings.ClientId,
                        ["client_secret"] = _settings.ClientSecret,
                        ["grant_type"] = "authorization_code",
                        ["code"] = code,
                        ["redirect_uri"] = _settings.RedirectUri,
                        ["code_verifier"] = stateData.CodeVerifier
                    }
                );

            request.Content.Headers.ContentType =
                new MediaTypeHeaderValue(
                    "application/x-www-form-urlencoded"
                );

            var response =
                await client.SendAsync(request);

            var responseBody =
                await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException(
                    $"Mercado Pago rechazó la autorización: {responseBody}"
                );
            }

            var tokenResponse =
                JsonSerializer.Deserialize<MercadoPagoTokenResponse>(
                    responseBody,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }
                );

            if (tokenResponse == null ||
                string.IsNullOrWhiteSpace(tokenResponse.AccessToken))
            {
                throw new InvalidOperationException(
                    "Mercado Pago no devolvió un Access Token válido."
                );
            }

            tenant.MercadoPagoAccessToken =
                _protector.Protect(
                    tokenResponse.AccessToken
                );

            tenant.MercadoPagoRefreshToken =
                !string.IsNullOrWhiteSpace(
                    tokenResponse.RefreshToken
                )
                    ? _protector.Protect(
                        tokenResponse.RefreshToken
                    )
                    : null;

            tenant.MercadoPagoUserId =
                tokenResponse.UserId?.ToString();

            tenant.MercadoPagoTokenExpiresAt =
                DateTime.UtcNow.AddSeconds(
                    tokenResponse.ExpiresIn
                );

            await _tenantRepository.UpdateOneAsync(tenant);

            return stateData.TenantId;
        }
        public int GetTenantIdFromState(string state)
        {
            try
            {
                var stateJson = _protector.Unprotect(state);

                var stateData = JsonSerializer.Deserialize<MercadoPagoState>(
                    stateJson
                );

                if (stateData == null)
                    throw new InvalidOperationException();

                return stateData.TenantId;
            }
            catch
            {
                throw new InvalidOperationException(
                    "El estado de autorización de Mercado Pago no es válido."
                );
            }
        }

        private static string GenerateCodeVerifier()
        {
            var bytes = RandomNumberGenerator.GetBytes(64);

            return Base64UrlEncode(bytes);
        }

        private static string GenerateCodeChallenge(
            string codeVerifier)
        {
            var bytes =
                SHA256.HashData(
                    Encoding.UTF8.GetBytes(codeVerifier)
                );

            return Base64UrlEncode(bytes);
        }

        private static string Base64UrlEncode(byte[] bytes)
        {
            return Convert
                .ToBase64String(bytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");
        }

        private class MercadoPagoState
        {
            public int TenantId { get; set; }

            public string CodeVerifier { get; set; } = null!;

            public string Nonce { get; set; } = null!;
        }
        public class MercadoPagoPreferenceResponse
        {
            [JsonPropertyName("id")]
            public string? Id { get; set; }

            [JsonPropertyName("init_point")]
            public string? InitPoint { get; set; }

            [JsonPropertyName("sandbox_init_point")]
            public string? SandboxInitPoint { get; set; }
        }

        private class MercadoPagoTokenResponse
        {
            [JsonPropertyName("access_token")]
            public string AccessToken { get; set; } = null!;

            [JsonPropertyName("refresh_token")]
            public string? RefreshToken { get; set; }

            [JsonPropertyName("user_id")]
            public long? UserId { get; set; }

            [JsonPropertyName("expires_in")]
            public int ExpiresIn { get; set; }
        }

        public string GetFrontendUrl()
        {
            return _settings.FrontendUrl;
        }
        public async Task<string> CreatePreference(
             Tenant tenant,
             Payment payment,
             User user,
             string planName)
        {
            // =========================================================
            // Verificar que el tenant tenga Mercado Pago conectado
            // =========================================================

            if (string.IsNullOrWhiteSpace(tenant.MercadoPagoAccessToken))
            {
                throw new InvalidOperationException(
                    "El gimnasio no tiene una cuenta de Mercado Pago conectada."
                );
            }

            var accessToken = await GetValidAccessToken(tenant);

            var client = _httpClientFactory.CreateClient();

            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    accessToken
                );

            // =========================================================
            // Crear preferencia
            // =========================================================

            var preference = new
            {
                items = new[]
                {
            new
            {
                id = payment.Id.ToString(),
                title = planName,
                description = $"Pago del plan {planName}",
                quantity = 1,
                currency_id = "ARS",
                unit_price = payment.Amount
            }
        },

                payer = new
                {
                    email = user.Email
                },

                // Payment.Id
                external_reference = payment.Id.ToString(),

                // Mercado Pago vuelve siempre a la misma página.
                // El estado real lo consultaremos desde nuestro backend.
                back_urls = new
                {
                    success = $"{_settings.FrontendUrl}/pagos/resultado",
                    failure = $"{_settings.FrontendUrl}/pagos/resultado",
                    pending = $"{_settings.FrontendUrl}/pagos/resultado"
                },

                auto_return = "approved",

                notification_url =
                    $"{_settings.BackendUrl}/api/mercadopago/webhook"
            };

            // =========================================================
            // Serializar JSON
            // =========================================================

            var json = JsonSerializer.Serialize(preference);

            var content = new StringContent(
                json,
                Encoding.UTF8,
                "application/json"
            );

            // =========================================================
            // Enviar a Mercado Pago
            // =========================================================

            var response = await client.PostAsync(
                "https://api.mercadopago.com/checkout/preferences",
                content
            );

            var responseBody = await response.Content.ReadAsStringAsync();

            Console.WriteLine("RESPUESTA MERCADO PAGO:");
            Console.WriteLine(responseBody);

            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException(
                    $"Mercado Pago rechazó la creación de la preferencia: {responseBody}"
                );
            }

            // =========================================================
            // Leer respuesta
            // =========================================================

            var preferenceResponse =
                JsonSerializer.Deserialize<MercadoPagoPreferenceResponse>(
                    responseBody,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }
                );

            if (preferenceResponse == null)
            {
                throw new InvalidOperationException(
                    "No se pudo deserializar la respuesta de Mercado Pago."
                );
            }

            if (string.IsNullOrWhiteSpace(preferenceResponse.InitPoint))
            {
                throw new InvalidOperationException(
                    $"Mercado Pago devolvió una preferencia pero InitPoint está vacío. " +
                    $"Respuesta: {responseBody}"
                );
            }

            return preferenceResponse.InitPoint;
        }

        public async Task<MercadoPagoPaymentResponseDTO> GetPayment(
            Tenant tenant,
            string paymentId)
        {
            if (string.IsNullOrWhiteSpace(tenant.MercadoPagoAccessToken))
            {
                throw new InvalidOperationException(
                    "El gimnasio no tiene una cuenta de Mercado Pago conectada."
                );
            }

            var accessToken = await GetValidAccessToken(tenant);

            var client = _httpClientFactory.CreateClient();

            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    accessToken
                );

            var response = await client.GetAsync(
                $"https://api.mercadopago.com/v1/payments/{paymentId}"
            );

            var responseBody =
                await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException(
                    $"Mercado Pago rechazó la consulta del pago: {responseBody}"
                );
            }

            var payment =
                JsonSerializer.Deserialize<MercadoPagoPaymentResponseDTO>(
                    responseBody,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }
                );

            if (payment == null)
            {
                throw new InvalidOperationException(
                    "Mercado Pago devolvió una respuesta inválida."
                );
            }

            return payment;
        }

        private async Task<string> GetValidAccessToken(Tenant tenant)
        {
            if (string.IsNullOrWhiteSpace(tenant.MercadoPagoAccessToken))
            {
                throw new InvalidOperationException(
                    "El gimnasio no tiene una cuenta de Mercado Pago conectada."
                );
            }

            // Dejamos unos minutos de margen antes de la expiración.
            var tokenIsValid =
                tenant.MercadoPagoTokenExpiresAt.HasValue &&
                tenant.MercadoPagoTokenExpiresAt.Value >
                DateTime.UtcNow.AddMinutes(5);

            if (tokenIsValid)
            {
                return _protector.Unprotect(
                    tenant.MercadoPagoAccessToken
                );
            }

            // Si llegó hasta acá, el Access Token está vencido
            // o está próximo a vencer.
            return await RefreshAccessToken(tenant);
        }
        private async Task<string> RefreshAccessToken(Tenant tenant)
        {
            if (string.IsNullOrWhiteSpace(tenant.MercadoPagoRefreshToken))
            {
                throw new InvalidOperationException(
                    "El gimnasio no tiene un Refresh Token válido de Mercado Pago."
                );
            }

            string refreshToken;

            try
            {
                refreshToken = _protector.Unprotect(
                    tenant.MercadoPagoRefreshToken
                );
            }
            catch
            {
                throw new InvalidOperationException(
                    "No se pudo recuperar el Refresh Token de Mercado Pago."
                );
            }

            var client = _httpClientFactory.CreateClient();

            var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://api.mercadopago.com/oauth/token"
            );

            request.Content = new FormUrlEncodedContent(
                new Dictionary<string, string>
                {
                    ["client_id"] = _settings.ClientId,
                    ["client_secret"] = _settings.ClientSecret,
                    ["grant_type"] = "refresh_token",
                    ["refresh_token"] = refreshToken
                }
            );

            var response = await client.SendAsync(request);

            var responseBody =
                await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException(
                    $"Mercado Pago rechazó la renovación del Access Token: {responseBody}"
                );
            }

            var tokenResponse =
                JsonSerializer.Deserialize<MercadoPagoTokenResponse>(
                    responseBody,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }
                );

            if (tokenResponse == null ||
                string.IsNullOrWhiteSpace(tokenResponse.AccessToken))
            {
                throw new InvalidOperationException(
                    "Mercado Pago no devolvió un Access Token válido al renovarlo."
                );
            }

            // Guardamos el nuevo Access Token
            tenant.MercadoPagoAccessToken =
                _protector.Protect(
                    tokenResponse.AccessToken
                );

            // IMPORTANTE:
            // Mercado Pago devuelve un nuevo Refresh Token.
            if (!string.IsNullOrWhiteSpace(
                tokenResponse.RefreshToken))
            {
                tenant.MercadoPagoRefreshToken =
                    _protector.Protect(
                        tokenResponse.RefreshToken
                    );
            }

            tenant.MercadoPagoTokenExpiresAt =
                DateTime.UtcNow.AddSeconds(
                    tokenResponse.ExpiresIn
                );

            // Por si Mercado Pago devuelve nuevamente el user_id.
            if (tokenResponse.UserId.HasValue)
            {
                tenant.MercadoPagoUserId =
                    tokenResponse.UserId.Value.ToString();
            }

            await _tenantRepository.UpdateOneAsync(tenant);

            return tokenResponse.AccessToken;
        }
        public async Task<object> GetConnectionStatus(
            int tenantId,
            int userId)
        {
            var tenant =
                await _tenantRepository.GetOneAsync(
                    t => t.Id == tenantId
                );

            if (tenant == null)
            {
                throw new InvalidOperationException(
                    "No se encontró el gimnasio."
                );
            }

            if (tenant.OwnerUserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "No tenés permisos para consultar la conexión de Mercado Pago de este gimnasio."
                );
            }

            return new
            {
                connected =
                    !string.IsNullOrWhiteSpace(
                        tenant.MercadoPagoAccessToken
                    ),

                mercadoPagoUserId =
                    tenant.MercadoPagoUserId
            };
        }
    }
}