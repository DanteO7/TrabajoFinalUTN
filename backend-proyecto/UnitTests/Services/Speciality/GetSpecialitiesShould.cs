using AutoMapper;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Speciality
{
    public class GetSpecialitiesShould
    {
        private readonly Mock<ISpecialityRepository> _specialityRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly SpecialityServices _specialityServices;

        public GetSpecialitiesShould()
        {
            _specialityRepoMock = new Mock<ISpecialityRepository>();
            _tenantRepoMock = new Mock<ITenantRepository>();
            _mapperMock = new Mock<IMapper>();

            _specialityServices = new SpecialityServices(
                _specialityRepoMock.Object,
                _tenantRepoMock.Object,
                _mapperMock.Object
            );
        }

        private backend_proyecto.Models.Tenant ValidTenant() => new backend_proyecto.Models.Tenant
        {
            Id = 1,
            Name = "Gym"
        };

        // =====================
        // GET ALL
        // =====================

        [Fact]
        public async Task ReturnSpecialities_WhenTenantExists()
        {
            // Arrange
            var specialities = new List<backend_proyecto.Models.Speciality>
            {
                new backend_proyecto.Models.Speciality
                {
                    Id = 1,
                    Name = "Nutrición",
                    TenantId = 1
                }
            };

            var response = new List<ResponseSpecialityDTO>
            {
                new ResponseSpecialityDTO
                {
                    Id = 1,
                    Name = "Nutrición",
                    TenantId = 1
                }
            };

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            _specialityRepoMock
                .Setup(r => r.GetAllAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Speciality, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Speciality, object>>[]>()))
                .ReturnsAsync(specialities);

            _mapperMock
                .Setup(m => m.Map<List<ResponseSpecialityDTO>>(specialities))
                .Returns(response);

            // Act
            var result = await _specialityServices.GetAllByTenantId(1);

            // Assert
            Assert.Single(result);
            Assert.Equal("Nutrición", result[0].Name);
        }

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
                _specialityServices.GetAllByTenantId(1));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un tenant con el Id = '1'", ex.Message);
        }
    }
}