using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.StudentPlan
{
    public class DeleteStudentPlanShould
    {
        private readonly Mock<IStudentPlanRepository> _studentPlanRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly StudentPlanServices _studentPlanServices;

        public DeleteStudentPlanShould()
        {
            _studentPlanRepoMock = new Mock<IStudentPlanRepository>();
            _tenantRepoMock = new Mock<ITenantRepository>();
            _mapperMock = new Mock<IMapper>();

            _studentPlanServices = new StudentPlanServices(
                _studentPlanRepoMock.Object,
                _tenantRepoMock.Object,
                _mapperMock.Object
            );
        }

        private backend_proyecto.Models.StudentPlan ValidStudentPlan() => new backend_proyecto.Models.StudentPlan
        {
            Id = 1,
            TenantId = 1,
            Name = "Plan Mensual",
            ClassesPerMonth = 8,
            Price = 3000
        };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task DeleteStudentPlan_WhenPlanExists()
        {
            // Arrange
            var studentPlan = ValidStudentPlan();

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(studentPlan);

            _studentPlanRepoMock
                .Setup(r => r.DeleteOneAsync(studentPlan))
                .Returns(Task.CompletedTask);

            // Act
            await _studentPlanServices.DeleteOne(1);

            // Assert
            _studentPlanRepoMock.Verify(r => r.DeleteOneAsync(studentPlan), Times.Once);
        }

        // =====================
        // PLAN NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenStudentPlanDoesNotExist()
        {
            // Arrange
            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.StudentPlan?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentPlanServices.DeleteOne(99));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un plan de estudiante con el Id = '99'", ex.Message);

            _studentPlanRepoMock.Verify(r => r.DeleteOneAsync(It.IsAny<backend_proyecto.Models.StudentPlan>()), Times.Never);
        }
    }
}
