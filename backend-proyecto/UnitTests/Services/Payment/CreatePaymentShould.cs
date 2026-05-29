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
    public class CreatePaymentShould
    {
        private readonly Mock<IPaymentRepository> _paymentRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IStudentPlanRepository> _studentPlanRepoMock;
        private readonly Mock<ITenantPlanRepository> _tenantPlanRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IMapper> _mapperMock;

        private readonly PaymentServices _paymentServices;

        public CreatePaymentShould()
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

        private backend_proyecto.Models.User ValidUser() =>
            new()
            {
                Id = 1,
                Name = "Juan",
                Surname = "Perez",
                Email = "juan@gmail.com",
                Password = "123"
            };

        private backend_proyecto.Models.Tenant ValidTenant() =>
            new()
            {
                Id = 1,
                Name = "Gym"
            };

        private backend_proyecto.Models.StudentPlan ValidStudentPlan() =>
            new()
            {
                Id = 1,
                Name = "Premium",
                Price = 1000
            };

        private backend_proyecto.Models.TenantPlan ValidTenantPlan() =>
            new()
            {
                Id = 1,
                Name = "Tenant Plan",
                Price = 5000
            };

        private CreatePaymentDTO ValidDto() =>
            new()
            {
                UserId = 1,
                PlanId = 1,
                PlanType = PlanType.STUDENT,
                TenantId = 1,
                PaymentDate = DateTime.Now,
                Amount = 1000,
                PaymentMethod = PaymentMethod.CASH
            };

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

        private ResponsePaymentDTO ValidResponse() =>
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
        public async Task CreatePayment_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();
            var user = ValidUser();
            var tenant = ValidTenant();
            var studentPlan = ValidStudentPlan();
            var payment = ValidPayment();
            var response = ValidResponse();

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(user);

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(studentPlan);

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(tenant);

            _mapperMock
                .Setup(m => m.Map<backend_proyecto.Models.Payment>(dto))
                .Returns(payment);

            _mapperMock
                .Setup(m => m.Map<ResponsePaymentDTO>(payment))
                .Returns(response);

            _paymentRepoMock
                .Setup(r => r.CreateOneAsync(payment))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _paymentServices.CreateOne(dto);

            // Assert
            Assert.NotNull(result);

            _paymentRepoMock.Verify(
                r => r.CreateOneAsync(payment),
                Times.Once
            );
        }

        [Fact]
        public async Task ThrowError_WhenUserDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.User?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);

            Assert.Equal(
                "No se encontró un usuario con el Id = '1'",
                ex.Message
            );
        }

        [Fact]
        public async Task ThrowError_WhenStudentPlanDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(ValidUser());

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.StudentPlan?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);

            Assert.Equal(
                "No se encontró un plan de estudiante con el Id = '1'",
                ex.Message
            );
        }

        [Fact]
        public async Task ThrowError_WhenTenantPlanDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();
            dto.PlanType = PlanType.TENANT;

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(ValidUser());

            _tenantPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.TenantPlan, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.TenantPlan?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);

            Assert.Equal(
                "No se encontró un plan de tenant con el Id = '1'",
                ex.Message
            );
        }

        [Fact]
        public async Task ThrowError_WhenPlanTypeIsInvalid()
        {
            // Arrange
            var dto = ValidDto();
            dto.PlanType = "INVALID";

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(ValidUser());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);

            Assert.Equal(
                "Tipo de plan inválido",
                ex.Message
            );
        }

        [Fact]
        public async Task ThrowError_WhenTenantDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(ValidUser());

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(ValidStudentPlan());

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Tenant?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);

            Assert.Equal(
                "No se encontró un tenant con el Id = '1'",
                ex.Message
            );
        }

        [Fact]
        public async Task ThrowError_WhenAmountIsInvalid()
        {
            // Arrange
            var dto = ValidDto();
            dto.Amount = 0;

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(ValidUser());

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(ValidStudentPlan());

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);

            Assert.Equal(
                "El monto a pagar no puede ser menor o igual a 0",
                ex.Message
            );
        }

        [Fact]
        public async Task ThrowError_WhenPaymentMethodIsInvalid()
        {
            // Arrange
            var dto = ValidDto();
            dto.PaymentMethod = "CRYPTO";

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(ValidUser());

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(ValidStudentPlan());

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);

            Assert.Equal(
                "No existe el metodo de pago con el nombre = 'CRYPTO'",
                ex.Message
            );
        }
    }
}