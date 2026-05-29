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
    public class UpdateStudentPlanShould
    {
        private readonly Mock<IStudentPlanRepository> _studentPlanRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly StudentPlanServices _studentPlanServices;

        public UpdateStudentPlanShould()
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

        private UpdateStudentPlanDTO ValidDto() => new UpdateStudentPlanDTO
        {
            Name = "Plan Actualizado",
            ClassesPerMonth = 10,
            Price = 4000
        };

        private ResponseStudentPlanDTO ValidResponseDto() => new ResponseStudentPlanDTO
        {
            Id = 1,
            TenantId = 1,
            Name = "Plan Actualizado",
            ClassesPerMonth = 10,
            Price = 4000
        };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task UpdateStudentPlan_WhenDataIsValid()
        {
            // Arrange
            var studentPlan = ValidStudentPlan();
            var dto = ValidDto();
            var responseDto = ValidResponseDto();

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(studentPlan);

            _mapperMock
                .Setup(m => m.Map(dto, studentPlan));

            _studentPlanRepoMock
                .Setup(r => r.UpdateOneAsync(studentPlan))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseStudentPlanDTO>(studentPlan))
                .Returns(responseDto);

            // Act
            var result = await _studentPlanServices.UpdateOne(1, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Plan Actualizado", result.Name);
            Assert.Equal(4000, result.Price);

            _studentPlanRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.StudentPlan>()), Times.Once);
        }

        // =====================
        // PLAN NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenStudentPlanDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.StudentPlan?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentPlanServices.UpdateOne(99, dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un plan de estudiante con el Id = '99'", ex.Message);

            _studentPlanRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.StudentPlan>()), Times.Never);
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

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(ValidStudentPlan());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentPlanServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _studentPlanRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.StudentPlan>()), Times.Never);
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

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(ValidStudentPlan());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentPlanServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _studentPlanRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.StudentPlan>()), Times.Never);
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

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(ValidStudentPlan());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentPlanServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _studentPlanRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.StudentPlan>()), Times.Never);
        }
    }
}
