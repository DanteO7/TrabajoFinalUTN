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
    public class UpdateActivityShould
    {
        private readonly Mock<IActivityRepository> _activityRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly ActivityServices _activityServices;

        public UpdateActivityShould()
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

        private backend_proyecto.Models.Activity ValidActivity() => new backend_proyecto.Models.Activity
        {
            Id = 1,
            Name = "Musculación",
            TenantId = 1
        };

        private UpdateActivityDTO ValidDto() => new UpdateActivityDTO
        {
            Name = "Crossfit"
        };

        private ResponseActivityDTO ValidResponseDto() => new ResponseActivityDTO
        {
            Id = 1,
            Name = "Crossfit",
            TenantId = 1
        };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task UpdateActivity_WhenDataIsValid()
        {
            // Arrange
            var activity = ValidActivity();
            var dto = ValidDto();
            var responseDto = ValidResponseDto();

            _activityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, object>>[]>()))
                .ReturnsAsync(activity);

            _mapperMock
                .Setup(m => m.Map(dto, activity));

            _activityRepoMock
                .Setup(r => r.UpdateOneAsync(activity))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseActivityDTO>(activity))
                .Returns(responseDto);

            // Act
            var result = await _activityServices.UpdateOne(1, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Crossfit", result.Name);

            _activityRepoMock.Verify(r =>
                r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.Activity>()),
                Times.Once);
        }

        // =====================
        // ACTIVIDAD NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenActivityDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _activityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, object>>[]>()))
                .ReturnsAsync((backend_proyecto.Models.Activity?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _activityServices.UpdateOne(99, dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró una actividad con el Id = '99'", ex.Message);

            _activityRepoMock.Verify(r =>
                r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.Activity>()),
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

            _activityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, object>>[]>()))
                .ReturnsAsync(ValidActivity());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _activityServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("El nombre del plan no puede tener mas de 50 caracteres", ex.Message);

            _activityRepoMock.Verify(r =>
                r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.Activity>()),
                Times.Never);
        }
    }
}