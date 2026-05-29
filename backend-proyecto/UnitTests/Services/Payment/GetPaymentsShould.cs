using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Payment
{
    public class GetPaymentsShould
    {
        private readonly Mock<IPaymentRepository> _paymentRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IMapper> _mapperMock;

        private readonly PaymentServices _paymentServices;

        public GetPaymentsShould()
        {
            _paymentRepoMock = new Mock<IPaymentRepository>();
            _userRepoMock = new Mock<IUserRepository>();
            _mapperMock = new Mock<IMapper>();

            _paymentServices = new PaymentServices(
                _paymentRepoMock.Object,
                _userRepoMock.Object,
                _mapperMock.Object,
                Mock.Of<IStudentPlanRepository>(),
                Mock.Of<ITenantPlanRepository>(),
                Mock.Of<ITenantRepository>()
            );
        }

        [Fact]
        public async Task GetPayments_WhenUserExists()
        {
            // Arrange
            var user = new backend_proyecto.Models.User { Id = 1 };

            var payments = new List<backend_proyecto.Models.Payment>
            {
                new() { Id = 1, UserId = 1 }
            };

            var response = new List<ResponsePaymentDTO>
            {
                new() { Id = 1, UserId = 1 }
            };

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(user);

            _paymentRepoMock
                .Setup(r => r.GetAllAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Payment, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Payment, object>>[]>()))
                .ReturnsAsync(payments);

            _mapperMock
                .Setup(m => m.Map<List<ResponsePaymentDTO>>(payments))
                .Returns(response);

            // Act
            var result = await _paymentServices.GetAllByIdUser(1);

            // Assert
            Assert.Single(result);
        }

        [Fact]
        public async Task ThrowError_WhenUserDoesNotExist()
        {
            // Arrange
            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.User?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentServices.GetAllByIdUser(1));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
        }
    }
}