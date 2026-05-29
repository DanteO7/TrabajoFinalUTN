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
    public class ChangeStatusStudentShould
    {
        private readonly Mock<IStudentRepository> _studentRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IStudentPlanRepository> _studentPlanRepoMock;
        private readonly Mock<IMapper> _mapperMock;

        private readonly StudentServices _studentServices;

        public ChangeStatusStudentShould()
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
                MonthlyFeeStatus = MonthlyFeeStatus.PENDING
            };

        private ChangeStatusStudentDTO ValidDto() =>
            new ChangeStatusStudentDTO
            {
                MonthlyFeeStatus = MonthlyFeeStatus.PAID
            };

        [Fact]
        public async Task ChangeStatus_WhenDataIsValid()
        {
            // Arrange
            var student = ValidStudent();

            _studentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, object>>[]>()))
                .ReturnsAsync(student);

            _studentRepoMock
                .Setup(r => r.UpdateOneAsync(student))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseStudentDTO>(student))
                .Returns(new ResponseStudentDTO
                {
                    Id = 1,
                    MonthlyFeeStatus = MonthlyFeeStatus.PAID
                });

            // Act
            var result = await _studentServices.ChangeStatus(1, ValidDto());

            // Assert
            Assert.NotNull(result);
            Assert.Equal(MonthlyFeeStatus.PAID, result.MonthlyFeeStatus);
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
                _studentServices.ChangeStatus(1, ValidDto()));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
        }

        [Fact]
        public async Task ThrowError_WhenStatusIsInvalid()
        {
            // Arrange
            var student = ValidStudent();

            var dto = new ChangeStatusStudentDTO
            {
                MonthlyFeeStatus = "INVALID"
            };

            _studentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, object>>[]>()))
                .ReturnsAsync(student);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentServices.ChangeStatus(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
        }

        [Fact]
        public async Task ThrowError_WhenStatusIsTheSame()
        {
            // Arrange
            var student = ValidStudent();

            var dto = new ChangeStatusStudentDTO
            {
                MonthlyFeeStatus = MonthlyFeeStatus.PENDING
            };

            _studentRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, object>>[]>()))
                .ReturnsAsync(student);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _studentServices.ChangeStatus(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
        }
    }
}