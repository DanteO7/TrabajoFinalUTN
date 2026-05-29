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
    public class DeleteProfessorShould
    {
        private readonly Mock<IProfessorRepository> _professorRepoMock;
        private readonly ProfessorServices _professorServices;

        public DeleteProfessorShould()
        {
            _professorRepoMock = new Mock<IProfessorRepository>();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var context = new ApplicationDbContext(options);

            _professorServices = new ProfessorServices(
                _professorRepoMock.Object,
                new Mock<IUserRepository>().Object,
                new Mock<ITenantRepository>().Object,
                new Mock<IMapper>().Object,
                new Mock<ISpecialityRepository>().Object,
                context
            );
        }

        private backend_proyecto.Models.Professor ValidProfessor() => new backend_proyecto.Models.Professor
        {
            Id = 1,
            UserId = 1,
            TenantId = 1
        };

        [Fact]
        public async Task DeleteProfessor_WhenProfessorExists()
        {
            // Arrange
            var professor = ValidProfessor();

            _professorRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Professor, bool>>>()))
                .ReturnsAsync(professor);

            _professorRepoMock
                .Setup(r => r.DeleteOneAsync(professor))
                .Returns(Task.CompletedTask);

            // Act
            await _professorServices.DeleteOne(1);

            // Assert
            _professorRepoMock.Verify(
                r => r.DeleteOneAsync(It.IsAny<backend_proyecto.Models.Professor>()),
                Times.Once
            );
        }

        [Fact]
        public async Task ThrowError_WhenProfessorDoesNotExist()
        {
            // Arrange
            _professorRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Professor, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Professor?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _professorServices.DeleteOne(99));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un usuario con el Id = '99'", ex.Message);
        }
    }
}