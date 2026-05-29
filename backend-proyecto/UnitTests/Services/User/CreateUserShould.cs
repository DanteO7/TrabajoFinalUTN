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
    public class CreateUserShould
    {
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IEncoderServices> _encoderServicesMock;
        private readonly ApplicationDbContext _db;
        private readonly UserServices _userServices;

        public CreateUserShould()
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

        private RegisterDTO ValidDto() => new RegisterDTO
        {
            Name = "Juan",
            Surname = "Perez",
            Email = "juan@example.com",
            Password = "password123",
            ConfirmPassword = "password123"
        };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task CreateUser_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();
            var user = new backend_proyecto.Models.User
            {
                Id = 1,
                Name = dto.Name,
                Surname = dto.Surname,
                Email = dto.Email,
                Password = dto.Password
            };

            _mapperMock
                .Setup(m => m.Map<backend_proyecto.Models.User>(dto))
                .Returns(user);

            _encoderServicesMock
                .Setup(e => e.Encode(dto.Password))
                .Returns("hashed_password");

            _userRepoMock
                .Setup(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.User>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _userServices.CreateOne(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("hashed_password", result.Password);

            _userRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.User>()), Times.Once);
            _encoderServicesMock.Verify(e => e.Encode(It.IsAny<string>()), Times.Once);
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
                _userServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _userRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.User>()), Times.Never);
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
                _userServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _userRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.User>()), Times.Never);
        }

        // =====================
        // VALIDACIONES DE EMAIL
        // =====================

        [Theory]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@example.com", "El email del usuario no puede tener mas de 100 caracteres")]
        public async Task ThrowError_WhenEmailIsTooLong(string email, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.Email = email;

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _userServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _userRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.User>()), Times.Never);
        }

        // =====================
        // VALIDACIONES DE TELÉFONO
        // =====================

        [Theory]
        [InlineData("123456789012345678901", "El numero de teléfono del usuario no puede tener mas de 20 caracteres")]
        public async Task ThrowError_WhenPhoneNumberIsTooLong(string phone, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.PhoneNumber = phone;

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _userServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _userRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.User>()), Times.Never);
        }

        // =====================
        // VALIDACIONES DE CONTRASEÑA
        // =====================

        [Theory]
        [InlineData("1234567", "La contraseña del usuario tiene que tener entre 8 y 255 caracteres")]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "La contraseña del usuario tiene que tener entre 8 y 255 caracteres")]
        public async Task ThrowError_WhenPasswordIsInvalid(string password, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.Password = password;

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _userServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _userRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.User>()), Times.Never);
        }

        // =====================
        // VALIDACIONES DE CONFIRMAR CONTRASEÑA
        // =====================

        [Theory]
        [InlineData("1234567", "La confirmación de la contraseña del usuario tiene que tener entre 8 y 255 caracteres")]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "La confirmación de la contraseña del usuario tiene que tener entre 8 y 255 caracteres")]
        public async Task ThrowError_WhenConfirmPasswordIsInvalid(string confirmPassword, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.ConfirmPassword = confirmPassword;

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _userServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _userRepoMock.Verify(r => r.CreateOneAsync(It.IsAny<backend_proyecto.Models.User>()), Times.Never);
        }
    }
}