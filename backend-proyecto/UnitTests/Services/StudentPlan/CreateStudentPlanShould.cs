using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.StudentPlan
{
    public class CreateStudentPlanShould
    {
        private readonly Mock<IStudentPlanRepository> _studentPlanRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly StudentPlanServices _studentPlanServices;

        public CreateStudentPlanShould()
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

        private CreateStudentPlanDTO ValidDto() => new CreateStudentPlanDTO
        {
            TenantId = 1,
            Name = "Plan Mensual",
            ClassesPerMonth = 8,
            Price = 3000
        };

        private backend_proyecto.Models.StudentPlan ValidStudentPlan() => new backend_proyecto.Models.StudentPlan
        {
            Id = 1,
            TenantId = 1,
            Name = "Plan Mensual",
            ClassesPerMonth = 8,
            Price = 3000
        };

        private ResponseStudentPlanDTO ValidResponseDto() => new ResponseStudentPlanDTO
        {
            Id = 1,
            TenantId = 1,
            Name = "Plan Mensual",
            ClassesPerMonth = 8,
            Price = 3000
        };

        private backend_proyecto.Models.Tenant ValidTenant() => new backend_proyecto.Models.Tenant
        {
            Id = 1,
            Name = "Gimnasio Test"
        };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task CreateStudentPlan_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();
            var studentPlan = ValidStudentPlan();
            var responseDto = ValidResponseDto();

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            _mapperMock
                .Setup(m => m.Map<backend_proyecto.Models.StudentPlan>(dto))
                .Returns(studentPlan);

            _studentPlanRepoMock
                .Setup(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.StudentPlan>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseStudentPlanDTO>(studentPlan))
                .Returns(responseDto);

            // Act
            var result = await _studentPlanServices.CreateOne(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Plan Mensual", result.Name);
            Assert.Equal(3000, result.Price);
            Assert.Equal(8, result.ClassesPerMonth);

            _studentPlanRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.StudentPlan>()), Times.Once);
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
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Tenant?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentPlanServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal($"No se encontró un tenant con el Id = '{dto.TenantId}'", ex.Message);

            _studentPlanRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.StudentPlan>()), Times.Never);
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

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentPlanServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _studentPlanRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.StudentPlan>()), Times.Never);
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

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentPlanServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _studentPlanRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.StudentPlan>()), Times.Never);
        }

        // =====================
        // VALIDACIONES DE CLASES POR MES
        // =====================

        [Theory]
        [InlineData(0, "Las clases por mes no pueden ser menor o igual a 0 o mayor a 23")]
        [InlineData(-1, "Las clases por mes no pueden ser menor o igual a 0 o mayor a 23")]
        [InlineData(24, "Las clases por mes no pueden ser menor o igual a 0 o mayor a 23")]
        public async Task ThrowError_WhenClassesPerMonthIsInvalid(int classesPerMonth, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.ClassesPerMonth = classesPerMonth;

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentPlanServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _studentPlanRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.StudentPlan>()), Times.Never);
        }
    }
}
