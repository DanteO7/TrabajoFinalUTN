using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Class;

public class UpdateClassShould
{
    private readonly Mock<IClassRepository> _classRepoMock;
    private readonly Mock<ITenantRepository> _tenantRepoMock;
    private readonly Mock<IActivityRepository> _activityRepoMock;
    private readonly Mock<IProfessorRepository> _professorRepoMock;
    private readonly Mock<IReservationRepository> _reservationRepoMock;
    private readonly Mock<IMapper> _mapperMock;

    private readonly ClassServices _classServices;

    public UpdateClassShould()
    {
        _classRepoMock = new Mock<IClassRepository>();
        _tenantRepoMock = new Mock<ITenantRepository>();
        _activityRepoMock = new Mock<IActivityRepository>();
        _professorRepoMock = new Mock<IProfessorRepository>();
        _reservationRepoMock = new Mock<IReservationRepository>();
        _mapperMock = new Mock<IMapper>();

        _classServices = new ClassServices(
            _classRepoMock.Object,
            _tenantRepoMock.Object,
            _mapperMock.Object,
            _activityRepoMock.Object,
            _professorRepoMock.Object,
            _reservationRepoMock.Object
        );
    }

    private backend_proyecto.Models.Class ValidClass() =>
        new backend_proyecto.Models.Class
        {
            Id = 1,
            ActivityId = 1,
            ProfessorId = 1,
            TenantId = 1,
            Date = DateTime.Now.AddDays(1),
            StartTime = new TimeOnly(10, 0),
            EndTime = new TimeOnly(11, 0),
            MaxCapacity = 20
        };

    private UpdateClassDTO ValidDto() =>
        new UpdateClassDTO
        {
            MaxCapacity = 30
        };

    private ResponseClassDTO ValidResponseDto() =>
        new ResponseClassDTO
        {
            Id = 1,
            MaxCapacity = 30
        };

    [Fact]
    public async Task UpdateClass_WhenDataIsValid()
    {
        // Arrange

        var classEntity = ValidClass();
        var dto = ValidDto();
        var responseDto = ValidResponseDto();

        _classRepoMock
            .Setup(r => r.GetOneAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, object>>[]>()))
            .ReturnsAsync(classEntity);

        _classRepoMock
            .Setup(r => r.UpdateOneAsync(classEntity))
            .Returns(Task.CompletedTask);

        _mapperMock
            .Setup(m => m.Map(dto, classEntity));

        _mapperMock
            .Setup(m => m.Map<ResponseClassDTO>(classEntity))
            .Returns(responseDto);

        // Act

        var result = await _classServices.UpdateOne(1, dto);

        // Assert

        Assert.NotNull(result);

        _classRepoMock.Verify(
            r => r.UpdateOneAsync(classEntity),
            Times.Once);
    }

    [Fact]
    public async Task ThrowError_WhenClassDoesNotExist()
    {
        // Arrange

        _classRepoMock
            .Setup(r => r.GetOneAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, object>>[]>()))
            .ReturnsAsync((backend_proyecto.Models.Class?)null);

        // Act

        var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
            _classServices.UpdateOne(1, ValidDto()));

        // Assert

        Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);

        Assert.Equal(
            "No se encontró una clase con el Id = '1'",
            ex.Message);
    }

    [Fact]
    public async Task ThrowError_WhenActivityDoesNotExist()
    {
        // Arrange

        var classEntity = ValidClass();

        var dto = new UpdateClassDTO
        {
            ActivityId = 99
        };

        _classRepoMock
            .Setup(r => r.GetOneAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, object>>[]>()))
            .ReturnsAsync(classEntity);

        _activityRepoMock
            .Setup(r => r.GetOneAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Activity, bool>>>()))
            .ReturnsAsync((backend_proyecto.Models.Activity?)null);

        // Act

        var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
            _classServices.UpdateOne(1, dto));

        // Assert

        Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
    }

    [Fact]
    public async Task ThrowError_WhenDateIsInPast()
    {
        // Arrange

        var classEntity = ValidClass();

        var dto = new UpdateClassDTO
        {
            Date = DateTime.Now.AddDays(-1)
        };

        _classRepoMock
            .Setup(r => r.GetOneAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, object>>[]>()))
            .ReturnsAsync(classEntity);

        // Act

        var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
            _classServices.UpdateOne(1, dto));

        // Assert

        Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
    }

    [Fact]
    public async Task ThrowError_WhenStartTimeIsGreaterThanEndTime()
    {
        // Arrange

        var classEntity = ValidClass();

        var dto = new UpdateClassDTO
        {
            StartTime = new TimeOnly(15, 0),
            EndTime = new TimeOnly(10, 0)
        };

        _classRepoMock
            .Setup(r => r.GetOneAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, object>>[]>()))
            .ReturnsAsync(classEntity);

        // Act

        var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
            _classServices.UpdateOne(1, dto));

        // Assert

        Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
    }

    [Fact]
    public async Task ThrowError_WhenMaxCapacityIsInvalid()
    {
        // Arrange

        var classEntity = ValidClass();

        var dto = new UpdateClassDTO
        {
            MaxCapacity = 0
        };

        _classRepoMock
            .Setup(r => r.GetOneAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, object>>[]>()))
            .ReturnsAsync(classEntity);

        // Act

        var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
            _classServices.UpdateOne(1, dto));

        // Assert

        Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
    }

    [Fact]
    public async Task ThrowError_WhenScheduleConflictExists()
    {
        // Arrange

        var classEntity = ValidClass();

        var dto = new UpdateClassDTO
        {
            StartTime = new TimeOnly(12, 0),
            EndTime = new TimeOnly(13, 0)
        };

        _classRepoMock
            .Setup(r => r.GetOneAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, object>>[]>()))
            .ReturnsAsync(classEntity);

        _classRepoMock
            .Setup(r => r.ExistsScheduleConflict(
                It.IsAny<CreateClassDTO>(),
                1))
            .ReturnsAsync(true);

        // Act

        var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
            _classServices.UpdateOne(1, dto));

        // Assert

        Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);

        Assert.Equal(
            "El profesor ya tiene una clase en ese horario",
            ex.Message);
    }
}