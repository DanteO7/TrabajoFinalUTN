using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using System.ComponentModel.DataAnnotations;

namespace UnitTests.Services.Tenant
{
    public class CancellationDeadlineShould
    {
        [Fact]
        public void NewTenantUsesTwentyMinuteDefault()
        {
            var tenant = new backend_proyecto.Models.Tenant();

            Assert.Equal(20, tenant.CancellationDeadlineMinutes);
        }

        [Theory]
        [InlineData(20)]
        [InlineData(60)]
        [InlineData(1440)]
        public void AcceptAllowedDeadlineValues(int minutes)
        {
            var dto = new UpdateTenantDTO
            {
                CancellationDeadlineMinutes = minutes
            };

            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(
                dto,
                new ValidationContext(dto),
                results,
                true
            );

            Assert.True(isValid);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        [InlineData(1441)]
        public void RejectDeadlineOutsideRange(int minutes)
        {
            var dto = new UpdateTenantDTO
            {
                CancellationDeadlineMinutes = minutes
            };

            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(
                dto,
                new ValidationContext(dto),
                results,
                true
            );

            Assert.False(isValid);
        }

        [Fact]
        public void TenantConfigurationsRemainIndependent()
        {
            var tenantA = new backend_proyecto.Models.Tenant
            {
                CancellationDeadlineMinutes = 20
            };
            var tenantB = new backend_proyecto.Models.Tenant
            {
                CancellationDeadlineMinutes = 60
            };

            Assert.Equal(20, tenantA.CancellationDeadlineMinutes);
            Assert.Equal(60, tenantB.CancellationDeadlineMinutes);
        }

        [Fact]
        public void AllowsCancellationBeforeDeadline()
        {
            var now = new DateTime(2026, 11, 20, 8, 0, 0);
            var classStart = new DateTime(2026, 11, 20, 10, 0, 0);

            var canCancel = ReservationServices.CanCancelReservation(
                now,
                classStart,
                60
            );

            Assert.True(canCancel);
        }

        [Fact]
        public void RejectsCancellationWithinDeadline()
        {
            var now = new DateTime(2026, 11, 20, 9, 30, 0);
            var classStart = new DateTime(2026, 11, 20, 10, 0, 0);

            var canCancel = ReservationServices.CanCancelReservation(
                now,
                classStart,
                60
            );

            Assert.False(canCancel);
        }

        [Fact]
        public void UsesTwentyMinutesForMissingOrInvalidValue()
        {
            var now = new DateTime(2026, 11, 20, 9, 41, 0);
            var classStart = new DateTime(2026, 11, 20, 10, 0, 0);

            Assert.True(
                ReservationServices.CanCancelReservation(
                    now,
                    classStart,
                    0
                )
            );
        }
    }
}
