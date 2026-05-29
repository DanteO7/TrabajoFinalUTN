using AutoMapper;
using backend_proyecto.Enums;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Moq;
using System.Net;

namespace UnitTests.Services.Reservation
{
    public class ChangeReservationStatusShould
    {
        private readonly Mock<IReservationRepository> _reservationRepoMock;
        private readonly Mock<IMapper> _mapperMock;

        private readonly ReservationServices _reservationServices;

        public ChangeReservationStatusShould()
        {
            _reservationRepoMock = new Mock<IReservationRepository>();
            _mapperMock = new Mock<IMapper>();

            _reservationServices = new ReservationServices(
                _reservationRepoMock.Object,
                Mock.Of<ITenantRepository>(),
                _mapperMock.Object,
                Mock.Of<IStudentRepository>(),
                Mock.Of<IClassRepository>(),
                Mock.Of<IStudentPlanRepository>()
            );
        }

        [Fact]
        public async Task ChangeStatus_WhenStatusIsValid()
        {
            // Arrange
            var reservation = new backend_proyecto.Models.Reservation
            {
                ReservationStatus = ReservationStatus.PENDING
            };

            var dto = new ChangeStatusReservationDTO
            {
                ReservationStatus = ReservationStatus.CONFIRMED
            };

            _reservationRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, object>>[]>()))
                .ReturnsAsync(reservation);

            _reservationRepoMock
                .Setup(r => r.UpdateOneAsync(reservation))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseReservationDTO>(reservation))
                .Returns(new ResponseReservationDTO());

            // Act
            var result = await _reservationServices.ChangeStatus(1, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(ReservationStatus.CONFIRMED, reservation.ReservationStatus);
        }

        [Fact]
        public async Task ThrowError_WhenStatusIsTheSame()
        {
            // Arrange
            var reservation = new backend_proyecto.Models.Reservation
            {
                ReservationStatus = ReservationStatus.PENDING
            };

            var dto = new ChangeStatusReservationDTO
            {
                ReservationStatus = ReservationStatus.PENDING
            };

            _reservationRepoMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, bool>>>(),
                    It.IsAny<System.Linq.Expressions.Expression<Func<backend_proyecto.Models.Reservation, object>>[]>()))
                .ReturnsAsync(reservation);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _reservationServices.ChangeStatus(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
        }
    }
}