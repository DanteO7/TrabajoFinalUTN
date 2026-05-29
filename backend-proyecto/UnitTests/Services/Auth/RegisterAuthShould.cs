using AutoMapper;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Net;

namespace UnitTests.Services.Auth
{
    public class RegisterAuthShould
    {
        private readonly Mock<IUserServices> _userServicesMock;
        private readonly Mock<IEncoderServices> _encoderServicesMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IConfiguration> _configMock;
        private readonly Mock<IProfessorRepository> _professorRepoMock;
        private readonly Mock<IStudentRepository> _studentRepoMock;
        private readonly Mock<IAdminRepository> _adminRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<HttpContext> _httpContextMock;
        private readonly Mock<IResponseCookies> _cookiesMock;
        private readonly AuthServices _authServices;

        public RegisterAuthShould()
        {
            _userServicesMock = new Mock<IUserServices>();
            _encoderServicesMock = new Mock<IEncoderServices>();
            _mapperMock = new Mock<IMapper>();
            _configMock = new Mock<IConfiguration>();
            _professorRepoMock = new Mock<IProfessorRepository>();
            _studentRepoMock = new Mock<IStudentRepository>();
            _adminRepoMock = new Mock<IAdminRepository>();
            _tenantRepoMock = new Mock<ITenantRepository>();
            _httpContextMock = new Mock<HttpContext>();
            _cookiesMock = new Mock<IResponseCookies>();

            var configSectionMock = new Mock<IConfigurationSection>();
            configSectionMock.Setup(s => s.Value).Returns("super_secret_key_for_testing_1234567890");
            _configMock.Setup(c => c.GetSection("Secrets:JWT")).Returns(configSectionMock.Object);

            var responseMock = new Mock<HttpResponse>();
            responseMock.Setup(r => r.Cookies).Returns(_cookiesMock.Object);
            _httpContextMock.Setup(c => c.Response).Returns(responseMock.Object);

            _professorRepoMock.Setup(r => r.ExistsByUserId(It.IsAny<int>())).ReturnsAsync(false);
            _studentRepoMock.Setup(r => r.ExistsByUserId(It.IsAny<int>())).ReturnsAsync(false);
            _adminRepoMock.Setup(r => r.ExistsByUserId(It.IsAny<int>())).ReturnsAsync(false);
            _tenantRepoMock.Setup(r => r.ExistsByUserId(It.IsAny<int>())).ReturnsAsync(false);

            _authServices = new AuthServices(
                _userServicesMock.Object,
                _encoderServicesMock.Object,
                _mapperMock.Object,
                _configMock.Object,
                _professorRepoMock.Object,
                _studentRepoMock.Object,
                _adminRepoMock.Object,
                _tenantRepoMock.Object
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
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task Register_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();
            var user = ValidUser();
            var userDto = ValidUserDto();

            _userServicesMock
                .Setup(s => s.GetOneByEmail(dto.Email))
                .ReturnsAsync((backend_proyecto.Models.User?)null);

            _userServicesMock
                .Setup(s => s.CreateOne(dto))
                .ReturnsAsync(user);

            _mapperMock
                .Setup(m => m.Map<UserWithoutPassDTO>(user))
                .Returns(userDto);

            // Act
            var result = await _authServices.Register(dto, _httpContextMock.Object);

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.Token);
            Assert.Equal(userDto.Email, result.User.Email);

            _userServicesMock.Verify(s => s.CreateOne(It.IsAny<RegisterDTO>()), Times.Once);
            _cookiesMock.Verify(c => c.Append("auth_token", It.IsAny<string>(), It.IsAny<CookieOptions>()), Times.Once);
        }

        // =====================
        // USUARIO YA EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenEmailAlreadyExists()
        {
            // Arrange
            var dto = ValidDto();

            _userServicesMock
                .Setup(s => s.GetOneByEmail(dto.Email))
                .ReturnsAsync(ValidUser());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() => _authServices.Register(dto, _httpContextMock.Object));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal($"El usuario con este mail '{dto.Email}' ya existe.", ex.Message);

            _userServicesMock.Verify(s => s.CreateOne(It.IsAny<RegisterDTO>()), Times.Never);
        }
    }
}