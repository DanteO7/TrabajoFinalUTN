using AutoMapper;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Reservation
{
    public class CreateReservationShould
    {
        private readonly Mock<IReservationRepository> _reservationRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IStudentRepository> _studentRepoMock;
        private readonly Mock<IClassRepository> _classRepoMock;
        private readonly Mock<IStudentPlanRepository> _studentPlanRepoMock;
        private readonly Mock<IMapper> _mapperMock;

        private readonly ReservationServices _reservationServices;

        public CreateReservationShould()
        {
            _reservationRepoMock = new Mock<IReservationRepository>();
            _tenantRepoMock = new Mock<ITenantRepository>();
            _studentRepoMock = new Mock<IStudentRepository>();
            _classRepoMock = new Mock<IClassRepository>();
            _studentPlanRepoMock = new Mock<IStudentPlanRepository>();
            _mapperMock = new Mock<IMapper>();

            _reservationServices = new ReservationServices(
                _reservationRepoMock.Object,
                _tenantRepoMock.Object,
                _mapperMock.Object,
                _studentRepoMock.Object,
                _classRepoMock.Object,
                _studentPlanRepoMock.Object
            );
        }

        private CreateReservationDTO ValidDto() =>
            new CreateReservationDTO
            {
                ClassId = 1,
                StudentId = 1,
                TenantId = 1,
                ReservationDate = DateTime.Now.AddDays(1)
            };

        private backend_proyecto.Models.Student ValidStudent() =>
            new backend_proyecto.Models.Student
            {
                Id = 1,
                TenantId = 1,
                StudentPlanId = 1,
                MonthlyFeeStatus = MonthlyFeeStatus.PAID
            };

        private backend_proyecto.Models.Class ValidClass() =>
            new backend_proyecto.Models.Class
            {
                Id = 1,
                MaxCapacity = 10
            };

        private backend_proyecto.Models.StudentPlan ValidStudentPlan() =>
            new backend_proyecto.Models.StudentPlan
            {
                Id = 1,
                Name = "Premium"
            };

        private ResponseReservationDTO ValidResponseDto() =>
            new ResponseReservationDTO
            {
                Id = 1,
                ClassId = 1,
                StudentId = 1,
                TenantId = 1,
                ReservationStatus = ReservationStatus.PENDING
            };

        [Fact]
        public async Task CreateReservation_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();
            var student = ValidStudent();
            var classEntity = ValidClass();
            var responseDto = ValidResponseDto();

            _studentRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, bool>>>()))
                .ReturnsAsync(student);

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(new backend_proyecto.Models.Tenant());

            _classRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Class, bool>>>()))
                .ReturnsAsync(classEntity);

            _reservationRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Reservation?)null);

            _reservationRepoMock
                .Setup(r => r.GetAllAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, object>>[]>()))
                .ReturnsAsync(new List<backend_proyecto.Models.Reservation>());

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(ValidStudentPlan());

            _mapperMock
                .Setup(m => m.Map<backend_proyecto.Models.Reservation>(dto))
                .Returns(new backend_proyecto.Models.Reservation());

            _reservationRepoMock
                .Setup(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Reservation>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseReservationDTO>(It.IsAny<backend_proyecto.Models.Reservation>()))
                .Returns(responseDto);

            // Act
            var result = await _reservationServices.CreateOne(dto);

            // Assert
            Assert.NotNull(result);

            _reservationRepoMock.Verify(
                r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Reservation>()),
                Times.Once);
        }

        [Fact]
        public async Task ThrowError_WhenStudentDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _studentRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Student?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _reservationServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
        }

        [Fact]
        public async Task ThrowError_WhenClassHasNoCapacity()
        {
            // Arrange
            var dto = ValidDto();

            _studentRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, bool>>>()))
                .ReturnsAsync(ValidStudent());

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(new backend_proyecto.Models.Tenant());

            _classRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Class, bool>>>()))
                .ReturnsAsync(new backend_proyecto.Models.Class
                {
                    Id = 1,
                    MaxCapacity = 1
                });

            _reservationRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Reservation?)null);

            _reservationRepoMock
                .Setup(r => r.GetAllAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, object>>[]>()))
                .ReturnsAsync(new List<backend_proyecto.Models.Reservation>
                {
                    new backend_proyecto.Models.Reservation()
                });

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _reservationServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("La clase no tiene cupos disponibles", ex.Message);
        }

        [Fact]
        public async Task ThrowError_WhenStudentFeeIsOverdue()
        {
            // Arrange
            var dto = ValidDto();

            var student = ValidStudent();
            student.MonthlyFeeStatus = MonthlyFeeStatus.OVERDUE;

            _studentRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Student, bool>>>()))
                .ReturnsAsync(student);

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(new backend_proyecto.Models.Tenant());

            _classRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Class, bool>>>()))
                .ReturnsAsync(ValidClass());

            _reservationRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Reservation?)null);

            _reservationRepoMock
                .Setup(r => r.GetAllAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, object>>[]>()))
                .ReturnsAsync(new List<backend_proyecto.Models.Reservation>());

            _studentPlanRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.StudentPlan, bool>>>()))
                .ReturnsAsync(ValidStudentPlan());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _reservationServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("El estudiante no tiene la cuota al día", ex.Message);
        }
    }
}