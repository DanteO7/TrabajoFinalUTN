using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.TenantPlan
{
    public class DeleteTenantPlanShould
    {
        private readonly Mock<ITenantPlanRepository> _tenantPlanRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly TenantPlanServices _tenantPlanServices;

        public DeleteTenantPlanShould()
        {
            _tenantPlanRepoMock = new Mock<ITenantPlanRepository>();
            _mapperMock = new Mock<IMapper>();

            _tenantPlanServices = new TenantPlanServices(
                _tenantPlanRepoMock.Object,
                _mapperMock.Object
            );
        }

        private backend_proyecto.Models.TenantPlan ValidTenantPlan() => new backend_proyecto.Models.TenantPlan
        {
            Id = 1,
            Name = "Plan Basico",
            Price = 5000,
            MaxStudents = 50,
            MaxProfessors = 10
        };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task DeleteTenantPlan_WhenPlanExists()
        {
            // Arrange
            var tenantPlan = ValidTenantPlan();

            _tenantPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.TenantPlan, bool>>>()))
                .ReturnsAsync(tenantPlan);

            _tenantPlanRepoMock
                .Setup(r => r.DeleteOneAsync(tenantPlan))
                .Returns(Task.CompletedTask);

            // Act
            await _tenantPlanServices.DeleteOne(1);

            // Assert
            _tenantPlanRepoMock.Verify(r => r.DeleteOneAsync(tenantPlan), Times.Once);
        }

        // =====================
        // PLAN NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenTenantPlanDoesNotExist()
        {
            // Arrange
            _tenantPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.TenantPlan, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.TenantPlan?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantPlanServices.DeleteOne(99));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un plan tenant con el Id = '99'", ex.Message);

            _tenantPlanRepoMock.Verify(r => r.DeleteOneAsync(It.IsAny<backend_proyecto.Models.TenantPlan>()), Times.Never);
        }
    }
}
