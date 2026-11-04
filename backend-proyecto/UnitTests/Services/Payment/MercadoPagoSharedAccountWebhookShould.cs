using backend_proyecto.Config;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using PaymentEntity = backend_proyecto.Models.Payment;

namespace UnitTests.Services.Payment
{
    public class MercadoPagoSharedAccountWebhookShould
    {
        private const long ReceiverAccountId = 323636535;
        private const string MercadoPagoPaymentId = "186706232075";

        [Fact]
        public async Task ResolvePaymentTenantAfterQueryingWithAnyValidSharedAccountCredential()
        {
            var harness = CreateHarness(
                paymentStatus: PaymentStatus.PENDING,
                storedMercadoPagoPaymentId: null,
                firstCredentialFails: true);

            await harness.PaymentServices.ProcessMercadoPagoWebhook(
                CreateWebhook(),
                "test-correlation");

            Assert.Equal(PaymentStatus.PAID, harness.Payment.Status);
            Assert.Equal("20", harness.Payment.TenantId.ToString());
            Assert.Equal(MercadoPagoPaymentId, harness.Payment.ExternalPaymentId);
            Assert.Equal(
                new[] { "access-token-18", "access-token-20" },
                harness.RequestedAccessTokens);
            Assert.Equal(1, harness.PaymentSaveCount);
            Assert.Equal(1, harness.StudentSaveCount);
        }

        [Fact]
        public async Task RejectCollectorThatDoesNotMatchTheSharedReceivingAccount()
        {
            var harness = CreateHarness(
                paymentStatus: PaymentStatus.PENDING,
                storedMercadoPagoPaymentId: null,
                firstCredentialFails: false,
                collectorId: ReceiverAccountId + 1);

            var exception = await Assert.ThrowsAsync<HttpResponseError>(
                () => harness.PaymentServices.ProcessMercadoPagoWebhook(
                    CreateWebhook(),
                    "test-correlation"));

            Assert.Equal(HttpStatusCode.BadRequest, exception.StatusCode);
            Assert.Equal(PaymentStatus.PENDING, harness.Payment.Status);
            Assert.Equal(0, harness.PaymentSaveCount);
            Assert.Equal(0, harness.StudentSaveCount);
        }

        [Fact]
        public async Task IgnoreRepeatedNotificationForAlreadyPaidPaymentWithoutSideEffects()
        {
            var harness = CreateHarness(
                paymentStatus: PaymentStatus.PAID,
                storedMercadoPagoPaymentId: MercadoPagoPaymentId,
                firstCredentialFails: false);

            await harness.PaymentServices.ProcessMercadoPagoWebhook(
                CreateWebhook(),
                "test-correlation");

            Assert.Equal(PaymentStatus.PAID, harness.Payment.Status);
            Assert.Equal(0, harness.PaymentSaveCount);
            Assert.Equal(0, harness.StudentSaveCount);
        }

        [Fact]
        public async Task RejectPaymentWhenItsBusinessIsNotLinkedToTheReceivingAccount()
        {
            var harness = CreateHarness(
                paymentStatus: PaymentStatus.PENDING,
                storedMercadoPagoPaymentId: null,
                firstCredentialFails: false,
                paymentTenantMercadoPagoUserId: "different-account");

            var exception = await Assert.ThrowsAsync<HttpResponseError>(
                () => harness.PaymentServices.ProcessMercadoPagoWebhook(
                    CreateWebhook(),
                    "test-correlation"));

            Assert.Equal(HttpStatusCode.BadRequest, exception.StatusCode);
            Assert.Equal(PaymentStatus.PENDING, harness.Payment.Status);
            Assert.Equal(0, harness.PaymentSaveCount);
            Assert.Equal(0, harness.StudentSaveCount);
        }

        [Fact]
        public async Task RejectWebhookWhenExternalReferenceDoesNotResolveToALocalPayment()
        {
            var harness = CreateHarness(
                paymentStatus: PaymentStatus.PENDING,
                storedMercadoPagoPaymentId: null,
                firstCredentialFails: false,
                localPaymentExists: false);

            var exception = await Assert.ThrowsAsync<HttpResponseError>(
                () => harness.PaymentServices.ProcessMercadoPagoWebhook(
                    CreateWebhook(),
                    "test-correlation"));

            Assert.Equal(HttpStatusCode.NotFound, exception.StatusCode);
            Assert.Equal(0, harness.PaymentSaveCount);
            Assert.Equal(0, harness.StudentSaveCount);
        }

        [Fact]
        public async Task KeepPaymentPendingWhenMercadoPagoDoesNotReportApproved()
        {
            var harness = CreateHarness(
                paymentStatus: PaymentStatus.PENDING,
                storedMercadoPagoPaymentId: null,
                firstCredentialFails: false,
                mercadoPagoStatus: "pending");

            await harness.PaymentServices.ProcessMercadoPagoWebhook(
                CreateWebhook(),
                "test-correlation");

            Assert.Equal(PaymentStatus.PENDING, harness.Payment.Status);
            Assert.Equal(1, harness.PaymentSaveCount);
            Assert.Equal(0, harness.StudentSaveCount);
        }

        private static MercadoPagoWebhookDTO CreateWebhook() =>
            new()
            {
                Type = "payment",
                UserId = ReceiverAccountId,
                Data = new MercadoPagoWebhookDataDTO
                {
                    Id = MercadoPagoPaymentId
                }
            };

        private static Harness CreateHarness(
            string paymentStatus,
            string? storedMercadoPagoPaymentId,
            bool firstCredentialFails,
            long? collectorId = null,
            string? paymentTenantMercadoPagoUserId = null,
            bool localPaymentExists = true,
            string mercadoPagoStatus = "approved")
        {
            var linkedAccountId = ReceiverAccountId.ToString();
            var credentials = new[]
            {
                new Tenant
                {
                    Id = 18,
                    MercadoPagoUserId = linkedAccountId
                },
                new Tenant
                {
                    Id = 20,
                    MercadoPagoUserId = linkedAccountId
                }
            };

            var paymentTenant = new Tenant
            {
                Id = 20,
                MercadoPagoUserId =
                    paymentTenantMercadoPagoUserId ?? linkedAccountId
            };
            credentials[1].MercadoPagoUserId =
                paymentTenant.MercadoPagoUserId;

            var payment = new PaymentEntity
            {
                Id = 80,
                UserId = 7,
                TenantId = 20,
                PlanId = 3,
                PlanType = PlanType.STUDENT,
                Amount = 1m,
                PaymentMethod = PaymentMethod.MERCADO_PAGO,
                PaymentDate = DateTime.UtcNow,
                Status = paymentStatus,
                ExternalPaymentId = storedMercadoPagoPaymentId
            };

            var tenantRepository = new Mock<ITenantRepository>();
            tenantRepository
                .Setup(repository => repository.GetAllAsync(
                    It.IsAny<Expression<Func<Tenant, bool>>>(),
                    It.IsAny<Expression<Func<Tenant, object>>[]>()))
                .ReturnsAsync(
                    (Expression<Func<Tenant, bool>>? filter,
                        Expression<Func<Tenant, object>>[] _) =>
                        credentials.AsQueryable()
                            .Where(filter!)
                            .ToList());
            tenantRepository
                .Setup(repository => repository.GetOneAsync(
                    It.IsAny<Expression<Func<Tenant, bool>>>(),
                    It.IsAny<Expression<Func<Tenant, object>>[]>()))
                .ReturnsAsync(
                    (Expression<Func<Tenant, bool>>? filter,
                        Expression<Func<Tenant, object>>[] _) =>
                        credentials.AsQueryable()
                            .FirstOrDefault(filter!));

            var paymentRepository = new Mock<IPaymentRepository>();
            paymentRepository
                .Setup(repository => repository.GetOneAsync(
                    It.IsAny<Expression<Func<PaymentEntity, bool>>>(),
                    It.IsAny<Expression<Func<PaymentEntity, object>>[]>()))
                .ReturnsAsync(
                    (Expression<Func<PaymentEntity, bool>>? filter,
                        Expression<Func<PaymentEntity, object>>[] _) =>
                        localPaymentExists && filter!.Compile()(payment)
                            ? payment
                            : null);

            var paymentSaveCount = 0;
            paymentRepository
                .Setup(repository => repository.UpdateOneAsync(
                    It.IsAny<PaymentEntity>()))
                .Callback(() => paymentSaveCount++)
                .Returns(Task.CompletedTask);

            var student = new Student
            {
                Id = 12,
                UserId = payment.UserId,
                TenantId = payment.TenantId,
                StudentPlanId = payment.PlanId,
                MonthlyFeeStatus = MonthlyFeeStatus.PENDING
            };
            var studentRepository = new Mock<IStudentRepository>();
            studentRepository
                .Setup(repository => repository.GetOneAsync(
                    It.IsAny<Expression<Func<Student, bool>>>(),
                    It.IsAny<Expression<Func<Student, object>>[]>()))
                .ReturnsAsync(student);

            var studentSaveCount = 0;
            studentRepository
                .Setup(repository => repository.UpdateOneAsync(
                    It.IsAny<Student>()))
                .Callback(() => studentSaveCount++)
                .Returns(Task.CompletedTask);

            var dataProtectionProvider =
                DataProtectionProvider.Create("TurnoFacil.MercadoPago.Tests");
            var protector = dataProtectionProvider.CreateProtector(
                "TurnoFacil.MercadoPago");

            credentials[0].MercadoPagoAccessToken =
                protector.Protect("access-token-18");
            credentials[1].MercadoPagoAccessToken =
                protector.Protect("access-token-20");
            foreach (var credential in credentials)
            {
                credential.MercadoPagoTokenExpiresAt =
                    DateTime.UtcNow.AddHours(1);
            }

            var requestedAccessTokens = new List<string?>();
            var httpClientFactory = new StubHttpClientFactory(request =>
            {
                requestedAccessTokens.Add(
                    request.Headers.Authorization?.Parameter);

                if (firstCredentialFails &&
                    request.Headers.Authorization?.Parameter ==
                    "access-token-18")
                {
                    return new HttpResponseMessage(HttpStatusCode.Unauthorized)
                    {
                        Content = new StringContent("{}")
                    };
                }

                var responseBody = JsonSerializer.Serialize(new
                {
                    id = long.Parse(MercadoPagoPaymentId),
                    status = mercadoPagoStatus,
                    status_detail = "accredited",
                    transaction_amount = 1m,
                    external_reference = payment.Id.ToString(),
                    collector_id = collectorId ?? ReceiverAccountId,
                    currency_id = "ARS"
                });

                return new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(
                        responseBody,
                        Encoding.UTF8,
                        "application/json")
                };
            });

            var mercadoPagoServices = new MercadoPagoServices(
                httpClientFactory,
                tenantRepository.Object,
                Options.Create(new MercadoPagoSettings()),
                dataProtectionProvider,
                NullLogger<MercadoPagoServices>.Instance);

            var paymentServices = new PaymentServices(
                paymentRepository.Object,
                null!,
                null!,
                null!,
                null!,
                tenantRepository.Object,
                mercadoPagoServices,
                null!,
                studentRepository.Object,
                null!,
                null!,
                null!,
                null!,
                NullLogger<PaymentServices>.Instance);

            return new Harness(
                paymentServices,
                payment,
                requestedAccessTokens,
                () => paymentSaveCount,
                () => studentSaveCount);
        }

        private sealed record Harness(
            PaymentServices PaymentServices,
            PaymentEntity Payment,
            List<string?> RequestedAccessTokens,
            Func<int> GetPaymentSaveCount,
            Func<int> GetStudentSaveCount)
        {
            public int PaymentSaveCount => GetPaymentSaveCount();

            public int StudentSaveCount => GetStudentSaveCount();
        }

        private sealed class StubHttpClientFactory : IHttpClientFactory
        {
            private readonly Func<HttpRequestMessage, HttpResponseMessage>
                _send;

            public StubHttpClientFactory(
                Func<HttpRequestMessage, HttpResponseMessage> send)
            {
                _send = send;
            }

            public HttpClient CreateClient(string name) =>
                new(new StubHttpMessageHandler(_send));
        }

        private sealed class StubHttpMessageHandler : HttpMessageHandler
        {
            private readonly Func<HttpRequestMessage, HttpResponseMessage>
                _send;

            public StubHttpMessageHandler(
                Func<HttpRequestMessage, HttpResponseMessage> send)
            {
                _send = send;
            }

            protected override Task<HttpResponseMessage> SendAsync(
                HttpRequestMessage request,
                CancellationToken cancellationToken) =>
                Task.FromResult(_send(request));
        }
    }
}
