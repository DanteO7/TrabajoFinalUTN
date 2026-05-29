using AutoMapper;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Speciality
{
    public class DeleteSpecialityShould
    {
        private readonly Mock<ISpecialityRepository> _specialityRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly SpecialityServices _specialityServices;

        public DeleteSpecialityShould()
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

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task DeleteSpeciality_WhenSpecialityExists()
        {
            // Arrange
            var speciality = ValidSpeciality();

            _specialityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Speciality, bool>>>()))
                .ReturnsAsync(speciality);

            _specialityRepoMock
                .Setup(r => r.DeleteOneAsync(speciality))
                .Returns(Task.CompletedTask);

            // Act
            await _specialityServices.DeleteOne(1);

            // Assert
            _specialityRepoMock.Verify(r =>
                r.DeleteOneAsync(It.IsAny<backend_proyecto.Models.Speciality>()),
                Times.Once);
        }

        // =====================
        // ESPECIALIDAD NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenSpecialityDoesNotExist()
        {
            // Arrange
            _specialityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<System.Func<backend_proyecto.Models.Speciality, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Speciality?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _specialityServices.DeleteOne(99));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró una especialidad con el Id = '99'", ex.Message);

            _specialityRepoMock.Verify(r =>
                r.DeleteOneAsync(It.IsAny<backend_proyecto.Models.Speciality>()),
                Times.Never);
        }
    }
}