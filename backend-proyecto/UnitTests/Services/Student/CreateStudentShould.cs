using AutoMapper;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Student
{
    public class AssignStudentShould
    {
        private readonly Mock<IStudentRepository> _studentRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IStudentPlanRepository> _studentPlanRepoMock;
        private readonly Mock<IMapper> _mapperMock;

        private readonly StudentServices _studentServices;

        public AssignStudentShould()
        {
            _studentRepoMock = new Mock<IStudentRepository>();
            _userRepoMock = new Mock<IUserRepository>();
            _tenantRepoMock = new Mock<ITenantRepository>();
            _studentPlanRepoMock = new Mock<IStudentPlanRepository>();
            _mapperMock = new Mock<IMapper>();

            _studentServices = new StudentServices(
                _studentRepoMock.Object,
                _userRepoMock.Object,
                _tenantRepoMock.Object,
                _studentPlanRepoMock.Object,
                _mapperMock.Object
            );
        }

        private AssignStudentDTO ValidDto() =>
            new AssignStudentDTO
            {
                UserId = 1,
                TenantId = 1,
                StudentPlanId = 1
            };

        private backend_proyecto.Models.Student ValidStudent() =>
            new backend_proyecto.Models.Student
            {
                Id = 1,
                UserId = 1,
                TenantId = 1,
                StudentPlanId = 1,
                MonthlyFeeStatus = MonthlyFeeStatus.PENDING
            };

        private ResponseStudentDTO ValidResponseDto() =>
            new ResponseStudentDTO
            {
                Id = 1,
                UserId = 1,
                TenantId = 1,
                StudentPlanId = 1,
                MonthlyFeeStatus = MonthlyFeeStatus.PENDING
            };

        private backend_proyecto.Models.User ValidUser() =>
            new backend_proyecto.Models.User
            {
                Id = 1,
                Name = "Juan"
            };

        private backend_proyecto.Models.Tenant ValidTenant() =>
            new backend_proyecto.Models.Tenant
            {
                Id = 1,
                Name = "Gym"
            };

        private backend_proyecto.Models.StudentPlan ValidPlan() =>
            new backend_proyecto.Models.StudentPlan
            {
                Id = 1,
                Name = "Plan Mensual",
                TenantId = 1,
                ClassesPerMonth = 8,
                Price = 3000
            };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task AssignStudent_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();
            var student = ValidStudent();
            var responseDto = ValidResponseDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(ValidUser());

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(ValidPlan());

            _studentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Student?)null);

            _mapperMock
                .Setup(m => m.Map<backend_proyecto.Models.Student>(dto))
                .Returns(student);

            _studentRepoMock
                .Setup(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Student>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseStudentDTO>(student))
                .Returns(responseDto);

            // Act
            var result = await _studentServices.AssignOne(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(MonthlyFeeStatus.PENDING, result.MonthlyFeeStatus);

            _studentRepoMock.Verify(
                r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Student>()),
                Times.Once);
        }

        // =====================
        // USER NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenUserDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.User?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentServices.AssignOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);

            Assert.Equal(
                "No se encontró un usuario con el Id = '1'",
                ex.Message);
        }

        // =====================
        // TENANT NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenTenantDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(ValidUser());

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Tenant?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentServices.AssignOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);

            Assert.Equal(
                "No se encontró un tenant con el Id = '1'",
                ex.Message);
        }

        // =====================
        // PLAN NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenPlanDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(ValidUser());

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.StudentPlan?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentServices.AssignOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);

            Assert.Equal(
                "No se encontró un plan de alumno con el Id = '1'",
                ex.Message);
        }

        // =====================
        // STUDENT YA EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenStudentAlreadyExists()
        {
            // Arrange
            var dto = ValidDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(ValidUser());

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(ValidPlan());

            _studentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, bool>>>()))
                .ReturnsAsync(ValidStudent());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentServices.AssignOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);

            Assert.Equal(
                "El usuario '1' ya está asignado a este tenant = '1'",
                ex.Message);
        }
    }
}