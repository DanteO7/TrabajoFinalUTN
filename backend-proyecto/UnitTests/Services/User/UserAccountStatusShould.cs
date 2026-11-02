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
    public class UserAccountStatusShould
    {
        private readonly ApplicationDbContext _db;
        private readonly UserServices _userServices;

        public UserAccountStatusShould()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _db = new ApplicationDbContext(options);

            var repository = new UserRepository(_db);
            var adminRepository = new AdminRepository(_db);
            _userServices = new UserServices(
                repository,
                Mock.Of<IMapper>(),
                Mock.Of<IEncoderServices>(),
                _db,
                adminRepository
            );
        }

        [Fact]
        public async Task AdminCanSuspendAndActivateUser()
        {
            var adminUser = new backend_proyecto.Models.User
            {
                Id = 1,
                Name = "Admin",
                Surname = "User",
                Email = "admin@example.com",
                Password = "hashed-password"
            };
            _db.Users.Add(adminUser);
            _db.Users.Add(new backend_proyecto.Models.User
            {
                Id = 2,
                Name = "Target",
                Surname = "User",
                Email = "target@example.com",
                Password = "hashed-password"
            });
            _db.Admin.Add(new Admin { UserId = 1, User = adminUser });
            await _db.SaveChangesAsync();

            await _userServices.SuspendOne(2, 1);
            Assert.False((await _db.Users.FindAsync(2))!.IsActive);

            await _userServices.ActivateOne(2, 1);
            Assert.True((await _db.Users.FindAsync(2))!.IsActive);
        }

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public async Task NonAdminCannotChangeUserAccountStatus(bool suspend)
        {
            _db.Users.Add(new backend_proyecto.Models.User
            {
                Id = 2,
                Name = "Target",
                Surname = "User",
                Email = "target@example.com",
                Password = "hashed-password"
            });
            await _db.SaveChangesAsync();

            var exception = await Assert.ThrowsAsync<HttpResponseError>(() =>
                suspend
                    ? _userServices.SuspendOne(2, 1)
                    : _userServices.ActivateOne(2, 1)
            );

            Assert.Equal(HttpStatusCode.Forbidden, exception.StatusCode);
            Assert.Equal(
                "Solo un administrador puede realizar esta acción.",
                exception.Message
            );
            Assert.True((await _db.Users.FindAsync(2))!.IsActive);
        }
    }
}
