using AutoMapper;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Activity
{
    public class DeleteActivityShould
    {
        private readonly Mock<IActivityRepository> _activityRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly ActivityServices _activityServices;

        public DeleteActivityShould()
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

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task DeleteActivity_WhenActivityExists()
        {
            // Arrange
            var activity = ValidActivity();

            _activityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, bool>>>()))
                .ReturnsAsync(activity);

            _activityRepoMock
                .Setup(r => r.DeleteOneAsync(activity))
                .Returns(Task.CompletedTask);

            // Act
            await _activityServices.DeleteOne(1);

            // Assert
            _activityRepoMock.Verify(r =>
                r.DeleteOneAsync(It.IsAny<backend_proyecto.Models.Activity>()),
                Times.Once);
        }

        // =====================
        // ACTIVIDAD NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenActivityDoesNotExist()
        {
            // Arrange
            _activityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Activity?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _activityServices.DeleteOne(99));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró una actividad con el Id = '99'", ex.Message);

            _activityRepoMock.Verify(r =>
                r.DeleteOneAsync(It.IsAny<backend_proyecto.Models.Activity>()),
                Times.Never);
        }
    }
}