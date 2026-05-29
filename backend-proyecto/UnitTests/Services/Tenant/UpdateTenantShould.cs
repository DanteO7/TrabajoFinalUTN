using AutoMapper;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Tenant
{
    public class UpdateTenantShould
    {
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<ITenantPlanRepository> _tenantPlanRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly TenantServices _tenantServices;

        public UpdateTenantShould()
        {
            _tenantRepoMock = new Mock<ITenantRepository>();
            _userRepoMock = new Mock<IUserRepository>();
            _tenantPlanRepoMock = new Mock<ITenantPlanRepository>();
            _mapperMock = new Mock<IMapper>();

            _tenantServices = new TenantServices(
                _tenantRepoMock.Object,
                _userRepoMock.Object,
                _tenantPlanRepoMock.Object,
                _mapperMock.Object
            );
        }

        private backend_proyecto.Models.Tenant ValidTenant() => new backend_proyecto.Models.Tenant
        {
            Id = 1,
            OwnerUserId = 1,
            Name = "Tenant Test",
            TenantPlanId = 1,
            IsActive = true,
            MonthlyFeeStatus = MonthlyFeeStatus.PAID
        };

        private UpdateTenantDTO ValidDto() => new UpdateTenantDTO
        {
            Name = "Tenant Updated",
            TenantPlanId = 2,
            IsActive = false,
            MonthlyFeeStatus = MonthlyFeeStatus.PENDING
        };

        private ResponseTenantDTO ValidResponseDto() => new ResponseTenantDTO
        {
            Id = 1,
            OwnerUserId = 1,
            Name = "Tenant Updated",
            TenantPlanId = 2,
            IsActive = false,
            MonthlyFeeStatus = MonthlyFeeStatus.PENDING
        };

        private backend_proyecto.Models.TenantPlan ValidTenantPlan() => new backend_proyecto.Models.TenantPlan
        {
            Id = 2,
            Name = "Premium"
        };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task UpdateTenant_WhenDataIsValid()
        {
            // Arrange
            var tenant = ValidTenant();
            var dto = ValidDto();
            var responseDto = ValidResponseDto();

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, object>>[]>()))
                .ReturnsAsync(tenant);

            _tenantPlanRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.TenantPlan, bool>>>()))
                .ReturnsAsync(ValidTenantPlan());

            _tenantRepoMock
                .Setup(r => r.UpdateOneAsync(tenant))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseTenantDTO>(tenant))
                .Returns(responseDto);

            // Act
            var result = await _tenantServices.UpdateOne(1, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Tenant Updated", result.Name);
            Assert.Equal(MonthlyFeeStatus.PENDING, result.MonthlyFeeStatus);

            _tenantRepoMock.Verify(r =>
                r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.Tenant>()),
                Times.Once);
        }

        // =====================
        // TENANT NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenTenantDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, object>>[]>()))
                .ReturnsAsync((backend_proyecto.Models.Tenant?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantServices.UpdateOne(99, dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un tenant con el Id = '99'", ex.Message);

            _tenantRepoMock.Verify(r =>
                r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.Tenant>()),
                Times.Never);
        }

        // =====================
        // NOMBRE MUY LARGO
        // =====================

        [Theory]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")]
        public async Task ThrowError_WhenNameIsTooLong(string name)
        {
            // Arrange
            var dto = ValidDto();
            dto.Name = name;

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, object>>[]>()))
                .ReturnsAsync(ValidTenant());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("El nombre no puede tener más de 50 caracteres", ex.Message);

            _tenantRepoMock.Verify(r =>
                r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.Tenant>()),
                Times.Never);
        }

        // =====================
        // PLAN NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenTenantPlanDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, object>>[]>()))
                .ReturnsAsync(ValidTenant());

            _tenantPlanRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.TenantPlan, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.TenantPlan?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal($"No existe plan con Id = '{dto.TenantPlanId}'", ex.Message);

            _tenantRepoMock.Verify(r =>
                r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.Tenant>()),
                Times.Never);
        }

        // =====================
        // ESTADO MENSUAL INVALIDO
        // =====================

        [Fact]
        public async Task ThrowError_WhenMonthlyFeeStatusIsInvalid()
        {
            // Arrange
            var dto = ValidDto();
            dto.TenantPlanId = null;
            dto.MonthlyFeeStatus = "INVALID";

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, object>>[]>()))
                .ReturnsAsync(ValidTenant());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("Estado inválido: 'INVALID'", ex.Message);

            _tenantRepoMock.Verify(r =>
                r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.Tenant>()),
                Times.Never);
        }
    }
}