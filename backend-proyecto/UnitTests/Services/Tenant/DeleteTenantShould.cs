using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Tenant
{
    public class DeleteTenantShould
    {
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<ITenantPlanRepository> _tenantPlanRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly TenantServices _tenantServices;

        public DeleteTenantShould()
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
            Name = "Tenant Test"
        };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task DeleteTenant_WhenTenantExists()
        {
            // Arrange
            var tenant = ValidTenant();

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(tenant);

            _tenantRepoMock
                .Setup(r => r.DeleteOneAsync(tenant))
                .Returns(Task.CompletedTask);

            // Act
            await _tenantServices.DeleteOne(1);

            // Assert
            _tenantRepoMock.Verify(r =>
                r.DeleteOneAsync(It.IsAny<backend_proyecto.Models.Tenant>()),
                Times.Once);
        }

        // =====================
        // TENANT NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenTenantDoesNotExist()
        {
            // Arrange
            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Tenant?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantServices.DeleteOne(99));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No existe Tenant con el Id = '99'", ex.Message);

            _tenantRepoMock.Verify(r =>
                r.DeleteOneAsync(It.IsAny<backend_proyecto.Models.Tenant>()),
                Times.Never);
        }
    }
}