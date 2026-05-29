using AutoMapper;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Payment
{
    public class UpdatePaymentShould
    {
        private readonly Mock<IPaymentRepository> _paymentRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IStudentPlanRepository> _studentPlanRepoMock;
        private readonly Mock<ITenantPlanRepository> _tenantPlanRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IMapper> _mapperMock;

        private readonly PaymentServices _paymentServices;

        public UpdatePaymentShould()
        {
            _paymentRepoMock = new Mock<IPaymentRepository>();
            _userRepoMock = new Mock<IUserRepository>();
            _studentPlanRepoMock = new Mock<IStudentPlanRepository>();
            _tenantPlanRepoMock = new Mock<ITenantPlanRepository>();
            _tenantRepoMock = new Mock<ITenantRepository>();
            _mapperMock = new Mock<IMapper>();

            _paymentServices = new PaymentServices(
                _paymentRepoMock.Object,
                _userRepoMock.Object,
                _mapperMock.Object,
                _studentPlanRepoMock.Object,
                _tenantPlanRepoMock.Object,
                _tenantRepoMock.Object
            );
        }

        private backend_proyecto.Models.Payment ValidPayment() =>
            new()
            {
                Id = 1,
                UserId = 1,
                PlanId = 1,
                PlanType = PlanType.STUDENT,
                TenantId = 1,
                Amount = 1000,
                PaymentMethod = PaymentMethod.CASH
            };

        [Fact]
        public async Task UpdatePayment_WhenDataIsValid()
        {
            // Arrange
            var payment = ValidPayment();

            var dto = new UpdatePaymentDTO
            {
                Amount = 2000
            };

            var response = new ResponsePaymentDTO
            {
                Id = 1,
                Amount = 2000
            };

            _paymentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Payment, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Payment, object>>[]>()))
                .ReturnsAsync(payment);

            _mapperMock
                .Setup(m => m.Map(dto, payment));

            _mapperMock
                .Setup(m => m.Map<ResponsePaymentDTO>(payment))
                .Returns(response);

            _paymentRepoMock
                .Setup(r => r.UpdateOneAsync(payment))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _paymentServices.UpdateOne(1, dto);

            // Assert
            Assert.NotNull(result);

            _paymentRepoMock.Verify(
                r => r.UpdateOneAsync(payment),
                Times.Once);
        }

        [Fact]
        public async Task ThrowError_WhenPaymentDoesNotExist()
        {
            // Arrange
            _paymentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Payment, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Payment, object>>[]>()))
                .ReturnsAsync((backend_proyecto.Models.Payment?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentServices.UpdateOne(1, new UpdatePaymentDTO()));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
        }

        [Fact]
        public async Task ThrowError_WhenUserDoesNotExist()
        {
            // Arrange
            var payment = ValidPayment();

            var dto = new UpdatePaymentDTO
            {
                UserId = 99
            };

            _paymentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Payment, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Payment, object>>[]>()))
                .ReturnsAsync(payment);

            _userRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.User?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
        }

        [Fact]
        public async Task ThrowError_WhenAmountIsInvalid()
        {
            // Arrange
            var payment = ValidPayment();

            var dto = new UpdatePaymentDTO
            {
                Amount = 0
            };

            _paymentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Payment, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Payment, object>>[]>()))
                .ReturnsAsync(payment);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
        }

        [Fact]
        public async Task ThrowError_WhenPaymentMethodIsInvalid()
        {
            // Arrange
            var payment = ValidPayment();

            var dto = new UpdatePaymentDTO
            {
                PaymentMethod = "CRYPTO"
            };

            _paymentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Payment, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Payment, object>>[]>()))
                .ReturnsAsync(payment);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
        }
    }
}