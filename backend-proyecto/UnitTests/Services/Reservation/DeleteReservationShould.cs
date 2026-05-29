using AutoMapper;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Reservation
{
    public class DeleteReservationShould
    {
        private readonly Mock<IReservationRepository> _reservationRepoMock;
        private readonly ReservationServices _reservationServices;

        public DeleteReservationShould()
        {
            _reservationRepoMock = new Mock<IReservationRepository>();

            _reservationServices = new ReservationServices(
                _reservationRepoMock.Object,
                Mock.Of<ITenantRepository>(),
                Mock.Of<IMapper>(),
                Mock.Of<IStudentRepository>(),
                Mock.Of<IClassRepository>(),
                Mock.Of<IStudentPlanRepository>()
            );
        }

        [Fact]
        public async Task DeleteReservation_WhenReservationExists()
        {
            // Arrange
            var reservation = new backend_proyecto.Models.Reservation();

            _reservationRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, bool>>>()))
                .ReturnsAsync(reservation);

            _reservationRepoMock
                .Setup(r => r.DeleteOneAsync(reservation))
                .Returns(Task.CompletedTask);

            // Act
            await _reservationServices.DeleteOne(1);

            // Assert
            _reservationRepoMock.Verify(r => r.DeleteOneAsync(reservation), Times.Once);
        }

        [Fact]
        public async Task ThrowError_WhenReservationDoesNotExist()
        {
            // Arrange
            _reservationRepoMock
                .Setup(r => r.GetOneAsync(It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, bool>>>()))
                .ReturnsAsync((backend_proyecto.Models.Reservation?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _reservationServices.DeleteOne(1));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
        }
    }
}