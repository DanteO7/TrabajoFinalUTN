using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend_proyecto.Controllers
{
    [Route("api/mercadopago")]
    [ApiController]
    public class MercadoPagoController : ControllerBase
    {
        private readonly MercadoPagoServices _mercadoPagoServices;
        private readonly PaymentServices _paymentServices;

        public MercadoPagoController(
            MercadoPagoServices mercadoPagoServices,
            PaymentServices paymentServices)
        {
            _mercadoPagoServices = mercadoPagoServices;
            _paymentServices = paymentServices;
        }

        [HttpGet("status/{tenantId}")]
        [Authorize]
        public async Task<IActionResult> GetStatus(int tenantId)
        {
            var userId =
                int.Parse(User.FindFirst("id")?.Value!);

            try
            {
                var status =
                    await _mercadoPagoServices.GetConnectionStatus(
                        tenantId,
                        userId
                    );

                return Ok(status);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("connect/{tenantId}")]
        [Authorize]
        public async Task<IActionResult> Connect(int tenantId)
        {
            var userId =
                int.Parse(User.FindFirst("id")?.Value!);

            try
            {
                var authorizationUrl =
                    await _mercadoPagoServices.GetAuthorizationUrl(
                        tenantId,
                        userId
                    );

                return Ok(new
                {
                    url = authorizationUrl
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("callback")]
        [AllowAnonymous]
        public async Task<IActionResult> Callback(
            [FromQuery] string code,
            [FromQuery] string state)
        {
            if (string.IsNullOrWhiteSpace(code) ||
                string.IsNullOrWhiteSpace(state))
            {
                return BadRequest(
                    "Mercado Pago no devolvió los datos necesarios."
                );
            }

            var tenantId = 0;

            try
            {
                tenantId = _mercadoPagoServices.GetTenantIdFromState(state);

                await _mercadoPagoServices.ConnectTenant(code, state);

                return Redirect(
                    $"{_mercadoPagoServices.GetFrontendUrl()}" +
                    $"/mercado-pago?connected=true&tenantId={tenantId}"
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Error conectando Mercado Pago: {ex.Message}"
                );

                return Redirect(
                    $"{_mercadoPagoServices.GetFrontendUrl()}" +
                    $"/mercado-pago?connected=false&tenantId={tenantId}"
                );
            }
        }

        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> Webhook(
            [FromBody] MercadoPagoWebhookDTO webhook)
        {
            try
            {
                Console.WriteLine("=== WEBHOOK MERCADO PAGO ===");

                Console.WriteLine(
                    $"Type: {webhook.Type}"
                );

                Console.WriteLine(
                    $"UserId: {webhook.UserId}"
                );

                Console.WriteLine(
                    $"PaymentId: {webhook.Data?.Id}"
                );

                await _paymentServices
                    .ProcessMercadoPagoWebhook(webhook);

                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Error procesando webhook de Mercado Pago: {ex}"
                );

                return BadRequest();
            }
        }

        [HttpDelete("disconnect/{tenantId}")]
        [Authorize]
        public async Task<IActionResult> Disconnect(int tenantId)
        {
            var userId =
                int.Parse(User.FindFirst("id")?.Value!);

            try
            {
                await _mercadoPagoServices.Disconnect(
                    tenantId,
                    userId
                );

                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}