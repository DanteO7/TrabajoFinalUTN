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
    public class UpdateUserShould
    {
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IEncoderServices> _encoderServicesMock;
        private readonly ApplicationDbContext _db;
        private readonly UserServices _userServices;

        public UpdateUserShould()
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

        private UpdateUserDTO ValidDto() => new UpdateUserDTO
        {
            Name = "Carlos",
            Surname = "Garcia"
        };

        private UserWithoutPassDTO ValidUserDto() => new UserWithoutPassDTO
        {
            Id = 1,
            Name = "Carlos",
            Surname = "Garcia",
            Email = "juan@example.com"
        };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task UpdateUser_WhenDataIsValid()
        {
            // Arrange
            var user = ValidUser();
            var dto = ValidDto();
            var userDto = ValidUserDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync(user);

            _mapperMock
                .Setup(m => m.Map(dto, user));

            _userRepoMock
                .Setup(r => r.UpdateOneAsync(user))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<UserWithoutPassDTO>(user))
                .Returns(userDto);

            // Act
            var result = await _userServices.UpdateOne(1, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Carlos", result.Name);

            _userRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.User>()), Times.Once);
        }

        // =====================
        // USUARIO NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenUserDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _userRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.User, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.User?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _userServices.UpdateOne(99, dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un usuario con el Id = '99'", ex.Message);

            _userRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.User>()), Times.Never);
        }

        // =====================
        // VALIDACIONES DE NOMBRE
        // =====================

        [Theory]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "El nombre del usuario no puede tener mas de 50 caracteres")]
        public async Task ThrowError_WhenNameIsTooLong(string name, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.Name = name;

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _userServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _userRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.User>()), Times.Never);
        }

        // =====================
        // VALIDACIONES DE APELLIDO
        // =====================

        [Theory]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "El apellido del usuario no puede tener mas de 50 caracteres")]
        public async Task ThrowError_WhenSurnameIsTooLong(string surname, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.Surname = surname;

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _userServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _userRepoMock.Verify(r => r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.User>()), Times.Never);
        }
    }
}