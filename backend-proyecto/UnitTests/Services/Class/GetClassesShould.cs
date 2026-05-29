using AutoMapper;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Class;

public class GetClassesShould
{
    private readonly Mock<IClassRepository> _classRepoMock;
    private readonly Mock<ITenantRepository> _tenantRepoMock;
    private readonly Mock<IMapper> _mapperMock;

    private readonly ClassServices _classServices;

    public GetClassesShould()
    {
        _classRepoMock = new Mock<IClassRepository>();
        _tenantRepoMock = new Mock<ITenantRepository>();
        _mapperMock = new Mock<IMapper>();

        _classServices = new ClassServices(
            _classRepoMock.Object,
            _tenantRepoMock.Object,
            _mapperMock.Object,
            Mock.Of<IActivityRepository>(),
            Mock.Of<IProfessorRepository>(),
            Mock.Of<IReservationRepository>()
        );
    }

    [Fact]
    public async Task GetClassesByDate_WhenTenantExists()
    {
        // Arrange

        var classes = new List<backend_proyecto.Models.Class>();

        var response = new List<ResponseClassDTO>();

        _tenantRepoMock
            .Setup(r => r.GetOneAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
            .ReturnsAsync(new backend_proyecto.Models.Tenant());

        _classRepoMock
            .Setup(r => r.GetAllAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Class, object>>[]>()))
            .ReturnsAsync(classes);

        _mapperMock
            .Setup(m => m.Map<List<ResponseClassDTO>>(classes))
            .Returns(response);

        // Act

        var result = await _classServices.GetClassesByDate(1, DateTime.Now);

        // Assert

        Assert.NotNull(result);
    }

    [Fact]
    public async Task ThrowError_WhenTenantDoesNotExist()
    {
        // Arrange

        _tenantRepoMock
            .Setup(r => r.GetOneAsync(
                It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
            .ReturnsAsync((backend_proyecto.Models.Tenant?)null);

        // Act

        var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
            _classServices.GetClassesByDate(1, DateTime.Now));

        // Assert

        Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
    }
}