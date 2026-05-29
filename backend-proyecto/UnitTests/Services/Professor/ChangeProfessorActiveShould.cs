using AutoMapper;
using backend_proyecto.Config;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Net;

namespace UnitTests.Services.Professor
{
    public class ChangeProfessorActiveShould
    {
        private readonly Mock<IProfessorRepository> _professorRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly ProfessorServices _professorServices;

        public ChangeProfessorActiveShould()
        {
            _professorRepoMock = new Mock<IProfessorRepository>();
            _mapperMock = new Mock<IMapper>();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var context = new ApplicationDbContext(options);

            _professorServices = new ProfessorServices(
                _professorRepoMock.Object,
                new Mock<IUserRepository>().Object,
                new Mock<ITenantRepository>().Object,
                _mapperMock.Object,
                new Mock<ISpecialityRepository>().Object,
                context
            );
        }

        private backend_proyecto.Models.Professor ValidProfessor() => new backend_proyecto.Models.Professor
        {
            Id = 1,
            IsActive = false
        };

        [Fact]
        public async Task ChangeActive_WhenProfessorExists()
        {
            // Arrange
            var professor = ValidProfessor();

            _professorRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Professor, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Professor, object>>[]>()))
                .ReturnsAsync(professor);

            _professorRepoMock
                .Setup(r => r.UpdateOneAsync(professor))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseProfessorDTO>(professor))
                .Returns(new ResponseProfessorDTO
                {
                    Id = 1,
                    IsActive = true
                });

            // Act
            var result = await _professorServices.ChangeActive(1);

            // Assert
            Assert.True(professor.IsActive);
            Assert.True(result.IsActive);
        }

        [Fact]
        public async Task ThrowError_WhenProfessorDoesNotExist()
        {
            // Arrange
            _professorRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Professor, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Professor, object>>[]>()))
                .ReturnsAsync((backend_proyecto.Models.Professor?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _professorServices.ChangeActive(1));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un usuario con el Id = '1'", ex.Message);
        }
    }
}