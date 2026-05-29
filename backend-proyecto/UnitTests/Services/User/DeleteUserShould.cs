using AutoMapper;
using backend_proyecto.Config;
using backend_proyecto.Models;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Net;

namespace UnitTests.Services.User
{
    public class DeleteUserShould
    {
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IEncoderServices> _encoderServicesMock;
        private readonly ApplicationDbContext _db;
        private readonly UserServices _userServices;

        public DeleteUserShould()
        {
            _userRepoMock = new Mock<IUserRepository>();
            _mapperMock = new Mock<IMapper>();
            _encoderServicesMock = new Mock<IEncoderServices>();
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _db = new ApplicationDbContext(options);

            _userServices = new UserServices(
                _userRepoMock.Object,
                _mapperMock.Object,
                _encoderServicesMock.Object,
                _db
            );
        }

        private backend_proyecto.Models.User ValidUser() => new backend_proyecto.Models.User
        {
            Id = 1,
            Name = "Juan",
            Surname = "Perez",
            Email = "juan@example.com",
            Password = "hashed_password"
        };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task DeleteUser_WhenUserExists()
        {
            // Arrange
            var user = ValidUser();

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(user);

            _userRepoMock
                .Setup(r => r.DeleteOneAsync(user))
                .Returns(Task.CompletedTask);

            // Act
            await _userServices.DeleteOne(1);

            // Assert
            _userRepoMock.Verify(r => r.DeleteOneAsync(user), Times.Once);
        }

        // =====================
        // USUARIO NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenUserDoesNotExist()
        {
            // Arrange
            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.User?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _userServices.DeleteOne(99));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un usuario con el Id = '99'", ex.Message);

            _userRepoMock.Verify(r => r.DeleteOneAsync(It.IsAny<backend_proyecto.Models.User>()), Times.Never);
        }
    }
}