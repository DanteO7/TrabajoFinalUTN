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
        private readonly ILogger<MercadoPagoController> _logger;

        public MercadoPagoController(
            MercadoPagoServices mercadoPagoServices,
            PaymentServices paymentServices,
            ILogger<MercadoPagoController> logger)
        {
            _mercadoPagoServices = mercadoPagoServices;
            _paymentServices = paymentServices;
            _logger = logger;
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
            var correlationId = HttpContext.TraceIdentifier;

            _logger.LogInformation(
                "Mercado Pago webhook received. CorrelationId={CorrelationId} NotificationId={NotificationId} NotificationType={NotificationType} NotificationAction={NotificationAction} MercadoPagoPaymentId={MercadoPagoPaymentId} ReceiverAccountId={ReceiverAccountId}",
                correlationId,
                webhook.Id,
                webhook.Type,
                webhook.Action,
                webhook.Data?.Id,
                webhook.UserId);

            try
            {
                await _paymentServices
                    .ProcessMercadoPagoWebhook(webhook, correlationId);

                _logger.LogInformation(
                    "Mercado Pago webhook processing completed. CorrelationId={CorrelationId} NotificationId={NotificationId} MercadoPagoPaymentId={MercadoPagoPaymentId}",
                    correlationId,
                    webhook.Id,
                    webhook.Data?.Id);

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    "Mercado Pago webhook processing failed. CorrelationId={CorrelationId} NotificationId={NotificationId} NotificationType={NotificationType} MercadoPagoPaymentId={MercadoPagoPaymentId} ReceiverAccountId={ReceiverAccountId} FailureType={FailureType}",
                    correlationId,
                    webhook.Id,
                    webhook.Type,
                    webhook.Data?.Id,
                    webhook.UserId,
                    ex.GetType().Name
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