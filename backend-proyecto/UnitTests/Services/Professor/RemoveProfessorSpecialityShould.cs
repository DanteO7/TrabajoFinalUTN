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
    public class RemoveProfessorSpecialityShould
    {
        private readonly Mock<IProfessorRepository> _professorRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly Mock<ISpecialityRepository> _specialityRepoMock;
        private readonly Mock<IMapper> _mapperMock;

        private readonly ApplicationDbContext _db;
        private readonly ProfessorServices _professorServices;

        public RemoveProfessorSpecialityShould()
        {
            _professorRepoMock = new Mock<IProfessorRepository>();
            _userRepoMock = new Mock<IUserRepository>();
            _tenantRepoMock = new Mock<ITenantRepository>();
            _specialityRepoMock = new Mock<ISpecialityRepository>();
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

        private backend_proyecto.Models.User ValidUser() =>
            new backend_proyecto.Models.User
            {
                Id = 1,
                Name = "Juan",
                Surname = "Perez",
                Email = "juan@test.com",
                Password = "123"
            };

        private backend_proyecto.Models.Professor ValidProfessor(
            backend_proyecto.Models.User user) =>
            new backend_proyecto.Models.Professor
            {
                Id = 1,
                UserId = 1,
                User = user,
                TenantId = 1,
                IsActive = true,
                ProfessorSpecialities = new List<ProfessorSpeciality>()
            };

        private backend_proyecto.Models.Speciality ValidSpeciality() =>
            new backend_proyecto.Models.Speciality
            {
                Id = 1,
                Name = "Yoga",
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
        public async Task RemoveSpeciality_WhenRelationExists()
        {
            // Arrange

            var user = ValidUser();

            var professor = ValidProfessor(user);

            var speciality = ValidSpeciality();

            var relation = new ProfessorSpeciality
            {
                ProfessorId = 1,
                Professor = professor,
                SpecialityId = 1,
                Speciality = speciality
            };

            professor.ProfessorSpecialities.Add(relation);

            // Seed REAL

            _db.Users.Add(user);

            _db.Professors.Add(professor);

            _db.Specialities.Add(speciality);

            _db.Set<ProfessorSpeciality>().Add(relation);

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
                .Returns(ValidResponseDto());

            // Act

            var result = await _professorServices.RemoveSpeciality(1, 1);

            // Assert

            Assert.NotNull(result);

            Assert.Empty(professor.ProfessorSpecialities);

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
                _professorServices.RemoveSpeciality(1, 1));

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

            var user = ValidUser();

            var professor = ValidProfessor(user);

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
                _professorServices.RemoveSpeciality(1, 1));

            // Assert

            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);

            Assert.Equal(
                "No se encontró una especialidad con el Id = '1'",
                ex.Message);
        }

        // =====================
        // RELACION NO EXISTE
        // =====================

        [Fact]
        public async Task ThrowError_WhenRelationDoesNotExist()
        {
            // Arrange

            var user = ValidUser();

            var professor = ValidProfessor(user);

            var speciality = ValidSpeciality();

            _db.Users.Add(user);

            _db.Professors.Add(professor);

            _db.Specialities.Add(speciality);

            await _db.SaveChangesAsync();

            _professorRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Professor, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Professor, object>>[]>()))
                .ReturnsAsync(professor);

            _specialityRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Speciality, bool>>>()))
                .ReturnsAsync(speciality);

            // Act

            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _professorServices.RemoveSpeciality(1, 1));

            // Assert

            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);

            Assert.Equal(
                "La especialidad con el Id = '1' no está asignada a el profesor con Id = '1'",
                ex.Message);
        }
    }
}