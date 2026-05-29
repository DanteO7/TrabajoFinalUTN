using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.TenantPlan
{
    public class UpdateTenantPlanShould
    {
        private readonly Mock<ITenantPlanRepository> _tenantPlanRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly TenantPlanServices _tenantPlanServices;

        public UpdateTenantPlanShould()
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

        private UpdateTenantPlanDTO ValidDto() => new UpdateTenantPlanDTO
        {
            Name = "Plan Actualizado",
            Price = 6000,
            MaxStudents = 60,
            MaxProfessors = 12
        };

        private ResponseTenantPlanDTO ValidResponseDto() => new ResponseTenantPlanDTO
        {
            Id = 1,
            Name = "Plan Actualizado",
            Price = 6000,
            MaxStudents = 60,
            MaxProfessors = 12
        };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task UpdateTenantPlan_WhenDataIsValid()
        {
            // Arrange
            var tenantPlan = ValidTenantPlan();
            var dto = ValidDto();
            var responseDto = ValidResponseDto();

            _tenantPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.TenantPlan, bool>>>()))
                .ReturnsAsync(tenantPlan);

            _mapperMock
                .Setup(m => m.Map(dto, tenantPlan));

            _tenantPlanRepoMock
                .Setup(r => r.UpdateOneAsync(tenantPlan))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseTenantPlanDTO>(tenantPlan))
                .Returns(responseDto);

            // Act
            var result = await _tenantPlanServices.UpdateOne(1, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Plan Actualizado", result.Name);
            Assert.Equal(6000, result.Price);

            _tenantPlanRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.TenantPlan>()), Times.Once);
        }

        // =====================
        // PLAN NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenTenantPlanDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _tenantPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.TenantPlan, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.TenantPlan?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantPlanServices.UpdateOne(99, dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un plan tenant con el Id = '99'", ex.Message);

            _tenantPlanRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.TenantPlan>()), Times.Never);
        }

        // =====================
        // VALIDACIONES DE PRECIO
        // =====================

        [Theory]
        [InlineData(0, "El precio no puede ser menor o igual a 0")]
        [InlineData(-100, "El precio no puede ser menor o igual a 0")]
        public async Task ThrowError_WhenPriceIsInvalid(decimal price, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.Price = price;

            _tenantPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.TenantPlan, bool>>>()))
                .ReturnsAsync(ValidTenantPlan());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantPlanServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _tenantPlanRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.TenantPlan>()), Times.Never);
        }

        // =====================
        // VALIDACIONES DE MAX STUDENTS
        // =====================

        [Theory]
        [InlineData(0, "El maximo de estudiantes no puede ser menor o igual a 0")]
        [InlineData(-5, "El maximo de estudiantes no puede ser menor o igual a 0")]
        public async Task ThrowError_WhenMaxStudentsIsInvalid(int maxStudents, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.MaxStudents = maxStudents;

            _tenantPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.TenantPlan, bool>>>()))
                .ReturnsAsync(ValidTenantPlan());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantPlanServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _tenantPlanRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.TenantPlan>()), Times.Never);
        }

        // =====================
        // VALIDACIONES DE MAX PROFESSORS
        // =====================

        [Theory]
        [InlineData(0, "El maximo de profesores no puede ser menor o igual a 0")]
        [InlineData(-3, "El maximo de profesores no puede ser menor o igual a 0")]
        public async Task ThrowError_WhenMaxProfessorsIsInvalid(int maxProfessors, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.MaxProfessors = maxProfessors;

            _tenantPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.TenantPlan, bool>>>()))
                .ReturnsAsync(ValidTenantPlan());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantPlanServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _tenantPlanRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.TenantPlan>()), Times.Never);
        }

        // =====================
        // VALIDACIONES DE NOMBRE
        // =====================

        [Theory]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "El nombre del plan no puede tener mas de 50 caracteres")]
        public async Task ThrowError_WhenNameIsTooLong(string name, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.Name = name;

            _tenantPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.TenantPlan, bool>>>()))
                .ReturnsAsync(ValidTenantPlan());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantPlanServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _tenantPlanRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.TenantPlan>()), Times.Never);
        }
    }
}
