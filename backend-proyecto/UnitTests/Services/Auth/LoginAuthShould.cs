using AutoMapper;
using backend_proyecto.Config;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Net;

namespace UnitTests.Services.Auth
{
    public class LoginAuthShould
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
        private readonly ApplicationDbContext _db;
        public LoginAuthShould()
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
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _db = new ApplicationDbContext(options);

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
                _tenantRepoMock.Object,
                _db
            );
        }

        private LoginDTO ValidDto() => new LoginDTO
        {
            Email = "juan@example.com",
            Password = "password123"
        };

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
        public async Task Login_WhenCredentialsAreValid()
        {
            // Arrange
            var dto = ValidDto();
            var user = ValidUser();

            _userServicesMock
                .Setup(s => s.GetOneByEmail(dto.Email))
                .ReturnsAsync(user);

            _encoderServicesMock
                .Setup(e => e.Verify(dto.Password, user.Password))
                .Returns(true);

            // Act
            var result = await _authServices.Login(dto, _httpContextMock.Object);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user.Email, result.Email);
            Assert.Equal(user.Name, result.Name);
            Assert.NotNull(result.Roles);
            Assert.IsType<AuthResponseDTO>(result);

            _cookiesMock.Verify(c => c.Append("auth_token", It.IsAny<string>(), It.IsAny<CookieOptions>()), Times.Once);
        }

        // =====================
        // USUARIO NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenUserDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _userServicesMock
                .Setup(s => s.GetOneByEmail(dto.Email))
                .ReturnsAsync((backend_proyecto.Models.User?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _authServices.Login(dto, _httpContextMock.Object));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("Invalid Credentials.", ex.Message);

            _encoderServicesMock.Verify(e => e.Verify(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
            _cookiesMock.Verify(c => c.Append(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CookieOptions>()), Times.Never);
        }

        // =====================
        // CONTRASEÑA INCORRECTA
        // =====================

        [Fact]
        public async Task ThrowError_WhenPasswordDoesNotMatch()
        {
            // Arrange
            var dto = ValidDto();
            var user = ValidUser();

            _userServicesMock
                .Setup(s => s.GetOneByEmail(dto.Email))
                .ReturnsAsync(user);

            _encoderServicesMock
                .Setup(e => e.Verify(dto.Password, user.Password))
                .Returns(false);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _authServices.Login(dto, _httpContextMock.Object));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("Invalid Credentials.", ex.Message);

            _cookiesMock.Verify(c => c.Append(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CookieOptions>()), Times.Never);
        }
    }
}