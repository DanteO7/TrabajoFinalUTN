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

namespace UnitTests.Services.User
{
    public class GetUserShould
    {
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IEncoderServices> _encoderServicesMock;
        private readonly ApplicationDbContext _db;
        private readonly UserServices _userServices;

        public GetUserShould()
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

        private UserWithoutPassDTO ValidUserDto() => new UserWithoutPassDTO
        {
            Id = 1,
            Name = "Juan",
            Surname = "Perez",
            Email = "juan@example.com"
        };

        // =====================
        // GET ONE BY ID
        // =====================

        [Fact]
        public async Task GetOneById_WhenUserExists()
        {
            // Arrange
            var user = ValidUser();
            var userDto = ValidUserDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(user);

            _mapperMock
                .Setup(m => m.Map<UserWithoutPassDTO>(user))
                .Returns(userDto);

            // Act
            var result = await _userServices.GetOneById(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("juan@example.com", result.Email);
        }

        [Fact]
        public async Task ThrowError_WhenUserDoesNotExist()
        {
            // Arrange
            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.User?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _userServices.GetOneById(99));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un usuario con el Id = '99'", ex.Message);
        }

        // =====================
        // GET ONE BY EMAIL
        // =====================

        [Fact]
        public async Task GetOneByEmail_WhenUserExists()
        {
            // Arrange
            var user = ValidUser();

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(user);

            // Act
            var result = await _userServices.GetOneByEmail("juan@example.com");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("juan@example.com", result.Email);
        }

        [Fact]
        public async Task GetOneByEmail_ReturnsNull_WhenUserDoesNotExist()
        {
            // Arrange
            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.User?)null);

            // Act
            var result = await _userServices.GetOneByEmail("noexiste@example.com");

            // Assert
            Assert.Null(result);
        }
    }
}