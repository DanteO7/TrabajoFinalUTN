using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Activity
{
    public class CreateActivityShould
    {
        private readonly Mock<IActivityRepository> _activityRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly ActivityServices _activityServices;

        public CreateActivityShould()
        {
            _activityRepoMock = new Mock<IActivityRepository>();
            _tenantRepoMock = new Mock<ITenantRepository>();
            _mapperMock = new Mock<IMapper>();

            _activityServices = new ActivityServices(
                _activityRepoMock.Object,
                _tenantRepoMock.Object,
                _mapperMock.Object
            );
        }

        private CreateActivityDTO ValidDto() => new CreateActivityDTO
        {
            Name = "Musculación",
            TenantId = 1
        };

        private backend_proyecto.Models.Activity ValidActivity() => new backend_proyecto.Models.Activity
        {
            Id = 1,
            Name = "Musculación",
            TenantId = 1
        };

        private ResponseActivityDTO ValidResponseDto() => new ResponseActivityDTO
        {
            Id = 1,
            Name = "Musculación",
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
        public async Task CreateActivity_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();
            var activity = ValidActivity();
            var responseDto = ValidResponseDto();

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            _activityRepoMock
                .Setup(r => r.ExistsByName(dto.Name))
                .ReturnsAsync(false);

            _mapperMock
                .Setup(m => m.Map<backend_proyecto.Models.Activity>(dto))
                .Returns(activity);

            _activityRepoMock
                .Setup(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Activity>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseActivityDTO>(activity))
                .Returns(responseDto);

            // Act
            var result = await _activityServices.CreateOne(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Musculación", result.Name);

            _activityRepoMock.Verify(r =>
                r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Activity>()),
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
                _activityServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal($"No se encontró un tenant con el Id = '{dto.TenantId}'", ex.Message);

            _activityRepoMock.Verify(r =>
                r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Activity>()),
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
                _activityServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(
                "El nombre de la actividad no puede ser nulo o tener mas de 50 caracteres",
                ex.Message);

            _activityRepoMock.Verify(r =>
                r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Activity>()),
                Times.Never);
        }

        // =====================
        // ACTIVIDAD DUPLICADA
        // =====================

        [Fact]
        public async Task ThrowError_WhenActivityAlreadyExists()
        {
            // Arrange
            var dto = ValidDto();

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            _activityRepoMock
                .Setup(r => r.ExistsByName(dto.Name))
                .ReturnsAsync(true);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _activityServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("Ya existe una actividad con ese nombre", ex.Message);

            _activityRepoMock.Verify(r =>
                r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Activity>()),
                Times.Never);
        }
    }
}