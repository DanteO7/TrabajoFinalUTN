using AutoMapper;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Speciality
{
    public class UpdateSpecialityShould
    {
        private readonly Mock<ISpecialityRepository> _specialityRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly SpecialityServices _specialityServices;

        public UpdateSpecialityShould()
        {
            _specialityRepoMock = new Mock<ISpecialityRepository>();
            _tenantRepoMock = new Mock<ITenantRepository>();
            _mapperMock = new Mock<IMapper>();

            _specialityServices = new SpecialityServices(
                _specialityRepoMock.Object,
                _tenantRepoMock.Object,
                _mapperMock.Object
            );
        }

        private backend_proyecto.Models.Speciality ValidSpeciality() => new backend_proyecto.Models.Speciality
        {
            Id = 1,
            Name = "Nutrición",
            TenantId = 1
        };

        private UpdateSpecialityDTO ValidDto() => new UpdateSpecialityDTO
        {
            Name = "Kinesiología"
        };

        private ResponseSpecialityDTO ValidResponseDto() => new ResponseSpecialityDTO
        {
            Id = 1,
            Name = "Kinesiología",
            TenantId = 1
        };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task UpdateSpeciality_WhenDataIsValid()
        {
            // Arrange
            var speciality = ValidSpeciality();
            var dto = ValidDto();
            var responseDto = ValidResponseDto();

            _specialityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Speciality, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Speciality, object>>[]>()))
                .ReturnsAsync(speciality);

            _mapperMock
                .Setup(m => m.Map(dto, speciality));

            _specialityRepoMock
                .Setup(r => r.UpdateOneAsync(speciality))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseSpecialityDTO>(speciality))
                .Returns(responseDto);

            // Act
            var result = await _specialityServices.UpdateOne(1, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Kinesiología", result.Name);

            _specialityRepoMock.Verify(r =>
                r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.Speciality>()),
                Times.Once);
        }

        // =====================
        // ESPECIALIDAD NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenSpecialityDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _specialityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Speciality, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Speciality, object>>[]>()))
                .ReturnsAsync((backend_proyecto.Models.Speciality?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _specialityServices.UpdateOne(99, dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró una especialidad con el Id = '99'", ex.Message);

            _specialityRepoMock.Verify(r =>
                r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.Speciality>()),
                Times.Never);
        }

        // =====================
        // NOMBRE MUY LARGO
        // =====================

        [Theory]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")]
        public async Task ThrowError_WhenNameIsTooLong(string name)
        {
            // Arrange
            var dto = ValidDto();
            dto.Name = name;

            _specialityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Speciality, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Speciality, object>>[]>()))
                .ReturnsAsync(ValidSpeciality());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _specialityServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("El nombre del plan no puede tener mas de 50 caracteres", ex.Message);

            _specialityRepoMock.Verify(r =>
                r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.Speciality>()),
                Times.Never);
        }

        // =====================
        // MISMO NOMBRE
        // =====================

        [Fact]
        public async Task ThrowError_WhenNameIsTheSame()
        {
            // Arrange
            var dto = new UpdateSpecialityDTO
            {
                Name = "Nutrición"
            };

            _specialityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Speciality, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Speciality, object>>[]>()))
                .ReturnsAsync(ValidSpeciality());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _specialityServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("El nombre del plan no puede ser igual al anterior", ex.Message);

            _specialityRepoMock.Verify(r =>
                r.UpdateOneAsync(It.IsAny<backend_proyecto.Models.Speciality>()),
                Times.Never);
        }
    }
}