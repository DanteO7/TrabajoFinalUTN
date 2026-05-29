using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Speciality
{
    public class CreateSpecialityShould
    {
        private readonly Mock<ISpecialityRepository> _specialityRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly SpecialityServices _specialityServices;

        public CreateSpecialityShould()
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

        private CreateSpecialityDTO ValidDto() => new CreateSpecialityDTO
        {
            Name = "Nutrición",
            TenantId = 1
        };

        private backend_proyecto.Models.Speciality ValidSpeciality() => new backend_proyecto.Models.Speciality
        {
            Id = 1,
            Name = "Nutrición",
            TenantId = 1
        };

        private ResponseSpecialityDTO ValidResponseDto() => new ResponseSpecialityDTO
        {
            Id = 1,
            Name = "Nutrición",
            TenantId = 1
        };

        private backend_proyecto.Models.Tenant ValidTenant() => new backend_proyecto.Models.Tenant
        {
            Id = 1,
            Name = "Gym Test"
        };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task CreateSpeciality_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();
            var speciality = ValidSpeciality();
            var responseDto = ValidResponseDto();

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            _specialityRepoMock
                .Setup(r => r.ExistsByName(dto.Name))
                .ReturnsAsync(false);

            _mapperMock
                .Setup(m => m.Map<backend_proyecto.Models.Speciality>(dto))
                .Returns(speciality);

            _specialityRepoMock
                .Setup(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Speciality>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseSpecialityDTO>(speciality))
                .Returns(responseDto);

            // Act
            var result = await _specialityServices.CreateOne(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Nutrición", result.Name);

            _specialityRepoMock.Verify(r =>
                r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Speciality>()),
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
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Tenant?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _specialityServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal($"No se encontró un tenant con el Id = '{dto.TenantId}'", ex.Message);

            _specialityRepoMock.Verify(r =>
                r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Speciality>()),
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
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _specialityServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(
                "El nombre del plan no puede ser nulo o tener mas de 50 caracteres",
                ex.Message);

            _specialityRepoMock.Verify(r =>
                r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Speciality>()),
                Times.Never);
        }

        // =====================
        // ESPECIALIDAD DUPLICADA
        // =====================

        [Fact]
        public async Task ThrowError_WhenSpecialityAlreadyExists()
        {
            // Arrange
            var dto = ValidDto();

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            _specialityRepoMock
                .Setup(r => r.ExistsByName(dto.Name))
                .ReturnsAsync(true);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _specialityServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("Ya existe una especialidad con ese nombre", ex.Message);

            _specialityRepoMock.Verify(r =>
                r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Speciality>()),
                Times.Never);
        }
    }
}