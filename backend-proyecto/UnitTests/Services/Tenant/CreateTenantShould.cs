using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Tenant
{
    public class CreateTenantShould
    {
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<ITenantPlanRepository> _tenantPlanRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly TenantServices _tenantServices;

        public CreateTenantShould()
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

        private CreateTenantDTO ValidDto() => new CreateTenantDTO
        {
            OwnerUserId = 1,
            Name = "Gimnasio Test",
            TenantPlanId = 1
        };

        private backend_proyecto.Models.User ValidUser() => new backend_proyecto.Models.User
        {
            Id = 1,
            Name = "Juan",
            Surname = "Perez",
            Email = "juan@example.com",
            Password = "hashed_password"
        };

        private backend_proyecto.Models.TenantPlan ValidTenantPlan() => new backend_proyecto.Models.TenantPlan
        {
            Id = 1,
            Name = "Plan Basico",
            Price = 5000,
            MaxStudents = 50,
            MaxProfessors = 10
        };

        private ResponseTenantDTO ValidResponseDto() => new ResponseTenantDTO
        {
            Id = 1,
            OwnerUserId = 1,
            Name = "Gimnasio Test",
            IsActive = true,
            TenantPlanId = 1,
            MonthlyFeeStatus = "PAID"
        };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task CreateTenant_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();
            var responseDto = ValidResponseDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(ValidUser());

            _tenantPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.TenantPlan, bool>>>()))
                .ReturnsAsync(ValidTenantPlan());

            _tenantRepoMock
                .Setup(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Tenant>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseTenantDTO>(It.IsAny<backend_proyecto.Models.Tenant>()))
                .Returns(responseDto);

            // Act
            var result = await _tenantServices.CreateOne(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Gimnasio Test", result.Name);
            Assert.True(result.IsActive);
            Assert.Equal("PAID", result.MonthlyFeeStatus);

            _tenantRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Tenant>()), Times.Once);
        }

        // =====================
        // USUARIO NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenUserDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.User?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal($"No existe Usuario con el Id = '{dto.OwnerUserId}'", ex.Message);

            _tenantRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Tenant>()), Times.Never);
        }

        // =====================
        // PLAN NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenTenantPlanDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(ValidUser());

            _tenantPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.TenantPlan, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.TenantPlan?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal($"No existe plan de Tenant con el Id = '{dto.TenantPlanId}'", ex.Message);

            _tenantRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Tenant>()), Times.Never);
        }
    }
}