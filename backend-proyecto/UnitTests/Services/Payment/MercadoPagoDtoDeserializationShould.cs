using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using System.Net;
using System.Text.Json;

namespace UnitTests.Services.Payment
{
    public class MercadoPagoDtoDeserializationShould
    {
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        [Fact]
        public void DeserializeWebhookSnakeCaseFields()
        {
            const string json = """
                {
                  "id": 44616202210797654,
                  "live_mode": true,
                  "type": "payment",
                  "date_created": "2026-11-04T15:40:00.000-03:00",
                  "user_id": 123456789,
                  "api_version": "v1",
                  "action": "payment.created",
                  "data": {
                    "id": "186706232075"
                  }
                }
                """;

            var webhook =
                JsonSerializer.Deserialize<MercadoPagoWebhookDTO>(
                    json,
                    JsonOptions);

            Assert.NotNull(webhook);
            Assert.Equal(123456789, webhook.UserId);
            Assert.True(webhook.LiveMode);
            Assert.Equal(
                new DateTimeOffset(2026, 11, 4, 15, 40, 0, TimeSpan.FromHours(-3)).DateTime,
                webhook.DateCreated);
            Assert.Equal("v1", webhook.ApiVersion);
            Assert.Equal("186706232075", webhook.Data?.Id);
        }

        [Fact]
        public void DeserializePaymentResponseSnakeCaseFields()
        {
            const string json = """
                {
                  "id": 186706232075,
                  "status": "approved",
                  "status_detail": "accredited",
                  "transaction_amount": 1250.50,
                  "external_reference": "77",
                  "collector_id": 123456789,
                  "currency_id": "ARS"
                }
                """;

            var payment =
                JsonSerializer.Deserialize<MercadoPagoPaymentResponseDTO>(
                    json,
                    JsonOptions);

            Assert.NotNull(payment);
            Assert.Equal(123456789, payment.CollectorId);
            Assert.Equal(1250.50m, payment.TransactionAmount);
            Assert.Equal("77", payment.ExternalReference);
            Assert.Equal("ARS", payment.CurrencyId);
            Assert.Equal("accredited", payment.StatusDetail);
        }

        [Fact]
        public async Task RejectWebhookWithoutAccountIdBeforeLookingUpBusiness()
        {
            const string json = """
                {
                  "type": "payment",
                  "data": {
                    "id": "186706232075"
                  }
                }
                """;

            var webhook =
                JsonSerializer.Deserialize<MercadoPagoWebhookDTO>(
                    json,
                    JsonOptions);
            var tenantRepository = new Mock<ITenantRepository>();
            var paymentServices = new PaymentServices(
                null!,
                null!,
                null!,
                null!,
                null!,
                tenantRepository.Object,
                null!,
                null!,
                null!,
                null!,
                null!,
                null!,
                null!,
                NullLogger<PaymentServices>.Instance);

            Assert.NotNull(webhook);
            Assert.Null(webhook.UserId);

            var exception = await Assert.ThrowsAsync<HttpResponseError>(
                () => paymentServices.ProcessMercadoPagoWebhook(
                    webhook,
                    "test-correlation"));

            Assert.Equal(HttpStatusCode.BadRequest, exception.StatusCode);
            tenantRepository.Verify(
                repository => repository.GetByMercadoPagoUserIdAsync(
                    It.IsAny<string>()),
                Times.Never);
        }
    }
}
