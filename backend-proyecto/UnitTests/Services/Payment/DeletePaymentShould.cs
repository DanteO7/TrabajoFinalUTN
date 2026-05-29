using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Payment
{
    public class DeletePaymentShould
    {
        private readonly Mock<IPaymentRepository> _paymentRepoMock;

        private readonly PaymentServices _paymentServices;

        public DeletePaymentShould()
        {
            _paymentRepoMock = new Mock<IPaymentRepository>();

            _paymentServices = new PaymentServices(
                _paymentRepoMock.Object,
                Mock.Of<IUserRepository>(),
                Mock.Of<IMapper>(),
                Mock.Of<IStudentPlanRepository>(),
                Mock.Of<ITenantPlanRepository>(),
                Mock.Of<ITenantRepository>()
            );
        }

        [Fact]
        public async Task DeletePayment_WhenPaymentExists()
        {
            // Arrange
            var payment = new backend_proyecto.Models.Payment
            {
                Id = 1
            };

            _paymentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Payment, bool>>>()))
                .ReturnsAsync(payment);

            _paymentRepoMock
                .Setup(r => r.DeleteOneAsync(payment))
                .Returns(Task.CompletedTask);

            // Act
            await _paymentServices.DeleteOne(1);

            // Assert
            _paymentRepoMock.Verify(
                r => r.DeleteOneAsync(payment),
                Times.Once);
        }

        [Fact]
        public async Task ThrowError_WhenPaymentDoesNotExist()
        {
            // Arrange
            _paymentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Payment, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Payment?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentServices.DeleteOne(1));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
        }
    }
}