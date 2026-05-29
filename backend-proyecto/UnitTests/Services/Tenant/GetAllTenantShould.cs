using AutoMapper;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using Moq;

namespace UnitTests.Services.Tenant
{
    public class GetAllTenantsShould
    {
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<ITenantPlanRepository> _tenantPlanRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly TenantServices _tenantServices;

        public GetAllTenantsShould()
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

        [Fact]
        public async Task ReturnAllTenants()
        {
            // Arrange
            var tenants = new List<backend_proyecto.Models.Tenant>
            {
                new backend_proyecto.Models.Tenant
                {
                    Id = 1,
                    Name = "Tenant 1"
                },
                new backend_proyecto.Models.Tenant
                {
                    Id = 2,
                    Name = "Tenant 2"
                }
            };

            var response = new List<ResponseTenantDTO>
            {
                new ResponseTenantDTO
                {
                    Id = 1,
                    Name = "Tenant 1"
                },
                new ResponseTenantDTO
                {
                    Id = 2,
                    Name = "Tenant 2"
                }
            };

            _tenantRepoMock
                .Setup(r => r.GetAllAsync(
                    null,
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, object>>[]>()))
                .ReturnsAsync(tenants);

            _mapperMock
                .Setup(m => m.Map<List<ResponseTenantDTO>>(tenants))
                .Returns(response);

            // Act
            var result = await _tenantServices.GetAll();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Equal("Tenant 1", result[0].Name);
            Assert.Equal("Tenant 2", result[1].Name);

            _tenantRepoMock.Verify(r =>
                r.GetAllAsync(
                    null,
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, object>>[]>()),
                Times.Once);
        }
    }
}