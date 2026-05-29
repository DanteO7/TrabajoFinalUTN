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
    public class AssignProfessorSpecialityShould
    {
        private readonly Mock<IProfessorRepository> _professorRepoMock;
        private readonly Mock<ISpecialityRepository> _specialityRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<IMapper> _mapperMock;

        private readonly ApplicationDbContext _db;
        private readonly ProfessorServices _professorServices;

        public AssignProfessorSpecialityShould()
        {
            _professorRepoMock = new Mock<IProfessorRepository>();
            _specialityRepoMock = new Mock<ISpecialityRepository>();
            _userRepoMock = new Mock<IUserRepository>();
            _tenantRepoMock = new Mock<ITenantRepository>();
            _mapperMock = new Mock<IMapper>();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _db = new ApplicationDbContext(options);

            _professorServices = new ProfessorServices(
                _professorRepoMock.Object,
                _userRepoMock.Object,
                _tenantRepoMock.Object,
                _mapperMock.Object,
                _specialityRepoMock.Object,
                _db
            );
        }

        private backend_proyecto.Models.Professor ValidProfessor() =>
            new backend_proyecto.Models.Professor
            {
                Id = 1,
                UserId = 1,
                TenantId = 1,
                IsActive = true,
                ProfessorSpecialities = new List<ProfessorSpeciality>()
            };

        private backend_proyecto.Models.Speciality ValidSpeciality() =>
            new backend_proyecto.Models.Speciality
            {
                Id = 1,
                Name = "Musculación",
                TenantId = 1
            };

        private ResponseProfessorDTO ValidResponseDto() =>
            new ResponseProfessorDTO
            {
                Id = 1,
                UserId = 1,
                TenantId = 1,
                IsActive = true
            };

        // =====================
        // CASO EXITOSO
        // =====================

        [Fact]
        public async Task AssignSpeciality_WhenDataIsValid()
        {
            // Arrange

            var user = new backend_proyecto.Models.User
            {
                Id = 1,
                Name = "Juan",
                Surname = "Perez",
                Email = "juan@test.com",
                Password = "123"
            };

            var professor = new backend_proyecto.Models.Professor
            {
                Id = 1,
                UserId = 1,
                User = user,
                TenantId = 1,
                IsActive = true,
                ProfessorSpecialities = new List<ProfessorSpeciality>()
            };

            var speciality = new backend_proyecto.Models.Speciality
            {
                Id = 1,
                Name = "Musculación",
                TenantId = 1
            };

            var responseDto = new ResponseProfessorDTO
            {
                Id = 1,
                UserId = 1,
                TenantId = 1,
                IsActive = true
            };

            // Seed REAL
            _db.Users.Add(user);
            _db.Professors.Add(professor);
            _db.Specialities.Add(speciality);

            await _db.SaveChangesAsync();

            // Mocks

            _professorRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Professor, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Professor, object>>[]>()))
                .ReturnsAsync(professor);

            _specialityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Speciality, bool>>>()))
                .ReturnsAsync(speciality);

            _professorRepoMock
                .Setup(r => r.HasSpeciality(1, 1))
                .ReturnsAsync(false);

            _professorRepoMock
                .Setup(r => r.Query())
                .Returns(_db.Professors);

            _professorRepoMock
                .Setup(r => r.UpdateOneAsync(
                    It.IsAny<backend_proyecto.Models.Professor>()))
                .Returns<backend_proyecto.Models.Professor>(async p =>
                {
                    _db.Professors.Update(p);
                    await _db.SaveChangesAsync();
                });

            _mapperMock
                .Setup(m => m.Map<ResponseProfessorDTO>(
                    It.IsAny<backend_proyecto.Models.Professor>()))
                .Returns(responseDto);

            // Act

            var result = await _professorServices.AssignSpeciality(1, 1);

            // Assert

            Assert.NotNull(result);

            Assert.Single(
                _db.Set<ProfessorSpeciality>()
            );

            _professorRepoMock.Verify(
                r => r.UpdateOneAsync(
                    It.IsAny<backend_proyecto.Models.Professor>()),
                Times.Once);
        }

        // =====================
        // PROFESSOR NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenProfessorDoesNotExist()
        {
            // Arrange

            _professorRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Professor, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Professor, object>>[]>()))
                .ReturnsAsync((backend_proyecto.Models.Professor?)null);

            // Act

            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _professorServices.AssignSpeciality(1, 1));

            // Assert

            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);

            Assert.Equal(
                "No se encontró un usuario con el Id = '1'",
                ex.Message);
        }

        // =====================
        // SPECIALITY NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenSpecialityDoesNotExist()
        {
            // Arrange

            var professor = ValidProfessor();

            _professorRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Professor, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Professor, object>>[]>()))
                .ReturnsAsync(professor);

            _specialityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Speciality, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Speciality?)null);

            // Act

            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _professorServices.AssignSpeciality(1, 1));

            // Assert

            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);

            Assert.Equal(
                "No se encontró una especialidad con el Id = '1'",
                ex.Message);
        }

        // =====================
        // YA TIENE LA ESPECIALIDAD
        // =====================

        [Fact]
        public async Task ThrowError_WhenProfessorAlreadyHasSpeciality()
        {
            // Arrange

            var professor = ValidProfessor();
            var speciality = ValidSpeciality();

            _professorRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Professor, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Professor, object>>[]>()))
                .ReturnsAsync(professor);

            _specialityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Speciality, bool>>>()))
                .ReturnsAsync(speciality);

            _professorRepoMock
                .Setup(r => r.HasSpeciality(1, 1))
                .ReturnsAsync(true);

            // Act

            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _professorServices.AssignSpeciality(1, 1));

            // Assert

            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);

            Assert.Equal(
                "La especialidad con el Id = '1' ya está asignada a el profesor con Id = '1'",
                ex.Message);
        }
    }
}