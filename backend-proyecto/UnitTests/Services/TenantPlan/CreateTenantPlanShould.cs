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
    public class CreateTenantPlanShould
    {
        private readonly Mock<ITenantPlanRepository> _tenantPlanRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly TenantPlanServices _tenantPlanServices;

        public CreateTenantPlanShould()
        {
            _tenantPlanRepoMock = new Mock<ITenantPlanRepository>();
            _mapperMock = new Mock<IMapper>();

            _tenantPlanServices = new TenantPlanServices(
                _tenantPlanRepoMock.Object,
                _mapperMock.Object
            );
        }

        private CreateTenantPlanDTO ValidDto() => new CreateTenantPlanDTO
        {
            Name = "Plan Basico",
            Price = 5000,
            MaxStudents = 50,
            MaxProfessors = 10
        };

        private backend_proyecto.Models.TenantPlan ValidTenantPlan() => new backend_proyecto.Models.TenantPlan
        {
            Id = 1,
            Name = "Plan Basico",
            Price = 5000,
            MaxStudents = 50,
            MaxProfessors = 10
        };

        private ResponseTenantPlanDTO ValidResponseDto() => new ResponseTenantPlanDTO
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
        public async Task CreateTenantPlan_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();
            var tenantPlan = ValidTenantPlan();
            var responseDto = ValidResponseDto();

            _mapperMock
                .Setup(m => m.Map<backend_proyecto.Models.TenantPlan>(dto))
                .Returns(tenantPlan);

            _tenantPlanRepoMock
                .Setup(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.TenantPlan>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseTenantPlanDTO>(tenantPlan))
                .Returns(responseDto);

            // Act
            var result = await _tenantPlanServices.CreateOne(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Plan Basico", result.Name);
            Assert.Equal(5000, result.Price);

            _tenantPlanRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.TenantPlan>()), Times.Once);
        }

        // =====================
        // VALIDACIONES DE NOMBRE
        // =====================

        [Theory]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "El nombre del plan no puede ser nulo o tener mas de 50 caracteres")]
        public async Task ThrowError_WhenNameIsTooLong(string name, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.Name = name;

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantPlanServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _tenantPlanRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.TenantPlan>()), Times.Never);
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

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantPlanServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _tenantPlanRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.TenantPlan>()), Times.Never);
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

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantPlanServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _tenantPlanRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.TenantPlan>()), Times.Never);
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

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _tenantPlanServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _tenantPlanRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.TenantPlan>()), Times.Never);
        }
    }
}
