using AutoMapper;
using backend_proyecto.Config;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Net;

namespace UnitTests.Services.Professor
{
    public class AssignProfessorShould
    {
        private readonly Mock<IProfessorRepository> _professorRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<ISpecialityRepository> _specialityRepoMock;
        private readonly Mock<IMapper> _mapperMock;

        private readonly ProfessorServices _professorServices;

        public AssignProfessorShould()
        {
            _professorRepoMock = new Mock<IProfessorRepository>();
            _userRepoMock = new Mock<IUserRepository>();
            _tenantRepoMock = new Mock<ITenantRepository>();
            _specialityRepoMock = new Mock<ISpecialityRepository>();
            _mapperMock = new Mock<IMapper>();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var context = new ApplicationDbContext(options);

            _professorServices = new ProfessorServices(
                _professorRepoMock.Object,
                _userRepoMock.Object,
                _tenantRepoMock.Object,
                _mapperMock.Object,
                _specialityRepoMock.Object,
                context
            );
        }

        private AssignProfessorDTO ValidDto() => new AssignProfessorDTO
        {
            UserId = 1,
            TenantId = 1
        };

        private backend_proyecto.Models.User ValidUser() => new backend_proyecto.Models.User
        {
            Id = 1,
            Name = "Juan"
        };

        private backend_proyecto.Models.Tenant ValidTenant() => new backend_proyecto.Models.Tenant
        {
            Id = 1,
            Name = "Gym"
        };

        private backend_proyecto.Models.Professor ValidProfessor() => new backend_proyecto.Models.Professor
        {
            Id = 1,
            UserId = 1,
            TenantId = 1,
            IsActive = false
        };

        private ResponseProfessorDTO ValidResponseDto() => new ResponseProfessorDTO
        {
            Id = 1,
            UserId = 1,
            TenantId = 1,
            IsActive = false
        };

        [Fact]
        public async Task AssignProfessor_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();
            var professor = ValidProfessor();
            var responseDto = ValidResponseDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(ValidUser());

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync(ValidTenant());

            _mapperMock
                .Setup(m => m.Map<backend_proyecto.Models.Professor>(dto))
                .Returns(professor);

            _professorRepoMock
                .Setup(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Professor>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseProfessorDTO>(professor))
                .Returns(responseDto);

            // Act
            var result = await _professorServices.AssignOne(dto);

            // Assert
            Assert.NotNull(result);
            Assert.False(result.IsActive);

            _professorRepoMock.Verify(
                r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.Professor>()),
                Times.Once
            );
        }

        [Fact]
        public async Task ThrowError_WhenUserDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.User?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _professorServices.AssignOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal($"No se encontró un usuario con el Id = '{dto.UserId}'", ex.Message);
        }

        [Fact]
        public async Task ThrowError_WhenTenantDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(ValidUser());

            _tenantRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Tenant, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Tenant?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _professorServices.AssignOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal($"No se encontró un tenant con el Id = '{dto.TenantId}'", ex.Message);
        }
    }
}