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
    public class GetActivitiesShould
    {
        private readonly Mock<IActivityRepository> _activityRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly ActivityServices _activityServices;

        public GetActivitiesShould()
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

        private backend_proyecto.Models.Tenant ValidTenant() => new backend_proyecto.Models.Tenant
        {
            Id = 1,
            Name = "Gym"
        };

        // =====================
        // GET ALL BY TENANT
        // =====================

        [Fact]
        public async Task ReturnActivities_WhenTenantExists()
        {
            // Arrange
            var activities = new List<backend_proyecto.Models.Activity>
            {
                new backend_proyecto.Models.Activity
                {
                    Id = 1,
                    Name = "Musculación",
                    TenantId = 1
                }
            };

            var response = new List<ResponseActivityDTO>
            {
                new ResponseActivityDTO
                {
                    Id = 1,
                    Name = "Musculación",
                    TenantId = 1
                }
            };

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            _activityRepoMock
                .Setup(r => r.GetAllAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, object>>[]>()))
                .ReturnsAsync(activities);

            _mapperMock
                .Setup(m => m.Map<List<ResponseActivityDTO>>(activities))
                .Returns(response);

            // Act
            var result = await _activityServices.GetAllByTenantId(1);

            // Assert
            Assert.Single(result);
            Assert.Equal("Musculación", result[0].Name);
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
                _activityServices.GetAllByTenantId(1));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un tenant con el Id = '1'", ex.Message);
        }

        // =====================
        // GET ONE
        // =====================

        [Fact]
        public async Task ReturnActivity_WhenActivityExists()
        {
            // Arrange
            var activity = new backend_proyecto.Models.Activity
            {
                Id = 1,
                Name = "Yoga",
                TenantId = 1
            };

            var response = new ResponseActivityDTO
            {
                Id = 1,
                Name = "Yoga",
                TenantId = 1
            };

            _activityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, object>>[]>()))
                .ReturnsAsync(activity);

            _mapperMock
                .Setup(m => m.Map<ResponseActivityDTO>(activity))
                .Returns(response);

            // Act
            var result = await _activityServices.GetOne(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Yoga", result.Name);
        }

        [Fact]
        public async Task ThrowError_WhenGetOneActivityDoesNotExist()
        {
            // Arrange
            _activityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, object>>[]>()))
                .ReturnsAsync((backend_proyecto.Models.Activity?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _activityServices.GetOne(99));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró una actividad con el Id = '99'", ex.Message);
        }
    }
}