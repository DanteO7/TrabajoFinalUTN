using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Class;

public class DeleteClassShould
{
    private readonly Mock<IClassRepository> _classRepoMock;
    private readonly ClassServices _classServices;

    public DeleteClassShould()
    {
        _classRepoMock = new Mock<IClassRepository>();

        _classServices = new ClassServices(
            _classRepoMock.Object,
            Mock.Of<ITenantRepository>(),
            Mock.Of<IMapper>(),
            Mock.Of<IActivityRepository>(),
            Mock.Of<IProfessorRepository>(),
            Mock.Of<IReservationRepository>()
        );
    }

    [Fact]
    public async Task DeleteClass_WhenClassExists()
    {
        // Arrange

        var classEntity = new backend_proyecto.Models.Class
        {
            Id = 1
        };

        _classRepoMock
            .Setup(r => r.GetOneAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, bool>>>()))
            .ReturnsAsync(classEntity);

        _classRepoMock
            .Setup(r => r.DeleteOneAsync(classEntity))
            .Returns(Task.CompletedTask);

        // Act

        await _classServices.DeleteOne(1);

        // Assert

        _classRepoMock.Verify(
            r => r.DeleteOneAsync(classEntity),
            Times.Once);
    }

    [Fact]
    public async Task ThrowError_WhenClassDoesNotExist()
    {
        // Arrange

        _classRepoMock
            .Setup(r => r.GetOneAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, bool>>>()))
            .ReturnsAsync((backend_proyecto.Models.Class?)null);

        // Act

        var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
            _classServices.DeleteOne(1));

        // Assert

        Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
    }
}