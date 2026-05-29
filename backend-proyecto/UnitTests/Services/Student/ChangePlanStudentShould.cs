using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Student
{
    public class ChangePlanStudentShould
    {
        private readonly Mock<IStudentRepository> _studentRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IStudentPlanRepository> _studentPlanRepoMock;
        private readonly Mock<IMapper> _mapperMock;

        private readonly StudentServices _studentServices;

        public ChangePlanStudentShould()
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

        private backend_proyecto.Models.Student ValidStudent() =>
            new backend_proyecto.Models.Student
            {
                Id = 1,
                StudentPlanId = 1
            };

        private backend_proyecto.Models.StudentPlan ValidPlan() =>
            new backend_proyecto.Models.StudentPlan
            {
                Id = 2,
                Name = "Nuevo Plan"
            };

        private ChangePlanStudentDTO ValidDto() =>
            new ChangePlanStudentDTO
            {
                StudentPlanId = 2
            };

        private ResponseStudentDTO ValidResponseDto() =>
            new ResponseStudentDTO
            {
                Id = 1,
                StudentPlanId = 2
            };

        [Fact]
        public async Task ChangePlan_WhenDataIsValid()
        {
            // Arrange
            var student = ValidStudent();
            var plan = ValidPlan();

            _studentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, object>>[]>()))
                .ReturnsAsync(student);

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(plan);

            _studentRepoMock
                .Setup(r => r.UpdateOneAsync(student))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseStudentDTO>(student))
                .Returns(ValidResponseDto());

            // Act
            var result = await _studentServices.ChangePlan(1, ValidDto());

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.StudentPlanId);
        }

        [Fact]
        public async Task ThrowError_WhenStudentDoesNotExist()
        {
            // Arrange
            _studentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, object>>[]>()))
                .ReturnsAsync((backend_proyecto.Models.Student?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentServices.ChangePlan(1, ValidDto()));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
        }

        [Fact]
        public async Task ThrowError_WhenPlanDoesNotExist()
        {
            // Arrange
            _studentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, object>>[]>()))
                .ReturnsAsync(ValidStudent());

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.StudentPlan?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentServices.ChangePlan(1, ValidDto()));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
        }

        [Fact]
        public async Task ThrowError_WhenPlanIsTheSame()
        {
            // Arrange
            var student = ValidStudent();

            var dto = new ChangePlanStudentDTO
            {
                StudentPlanId = 1
            };

            _studentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, object>>[]>()))
                .ReturnsAsync(student);

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(new backend_proyecto.Models.StudentPlan
                {
                    Id = 1
                });

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentServices.ChangePlan(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
        }
    }
}