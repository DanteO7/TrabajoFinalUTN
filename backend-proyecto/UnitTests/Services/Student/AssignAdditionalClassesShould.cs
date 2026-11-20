using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using Moq;
using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;

namespace UnitTests.Services.Student
{
    public class AssignAdditionalClassesShould
    {
        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        [InlineData(100)]
        public void RejectQuantityOutsideRange(int quantity)
        {
            var dto = new AssignAdditionalClassesDTO { Quantity = quantity };

            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(
                dto,
                new ValidationContext(dto),
                results,
                true
            );

            Assert.False(isValid);
        }

        [Theory]
        [InlineData(1)]
        [InlineData(99)]
        public void AcceptQuantityInRange(int quantity)
        {
            var dto = new AssignAdditionalClassesDTO { Quantity = quantity };

            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(
                dto,
                new ValidationContext(dto),
                results,
                true
            );

            Assert.True(isValid);
        }

        [Fact]
        public void KeepOriginalPlanClassesWhenAddingExtras()
        {
            var plan = new StudentPlan
            {
                Id = 1,
                ClassesPerMonth = 8
            };
            var student = new backend_proyecto.Models.Student
            {
                Id = 1,
                StudentPlan = plan,
                StudentPlanId = plan.Id,
                AdditionalClasses = 5
            };

            Assert.Equal(8, plan.ClassesPerMonth);
            Assert.Equal(13, plan.ClassesPerMonth + student.AdditionalClasses);
        }

        [Fact]
        public async Task IncludeAdditionalClassesInReservationLimit()
        {
            var planRepository = new Mock<IStudentPlanRepository>();
            var reservationRepository = new Mock<IReservationRepository>();

            planRepository
                .Setup(r => r.GetOneAsync(
                    It.IsAny<Expression<Func<StudentPlan, bool>>>()))
                .ReturnsAsync(new StudentPlan { ClassesPerMonth = 4 });

            reservationRepository
                .Setup(r => r.CountAsync(
                    It.IsAny<Expression<Func<Reservation, bool>>>()))
                .ReturnsAsync(6);

            var validation = new ReservationValidationServices(
                planRepository.Object,
                reservationRepository.Object
            );

            var student = new backend_proyecto.Models.Student
            {
                Id = 1,
                Name = "Ana",
                Surname = "Perez",
                StudentPlanId = 1,
                AdditionalClasses = 3,
                MonthlyFeeStatus = Enums.MonthlyFeeStatus.PAID,
                PaymentDueDate = DateTime.UtcNow.Date.AddDays(15)
            };

            var classEntity = new backend_proyecto.Models.Class
            {
                Date = DateOnly.FromDateTime(DateTime.UtcNow)
            };

            var error = await validation.ValidateStudentForClass(
                student,
                classEntity
            );

            Assert.Null(error);
        }

        [Fact]
        public void ResetAdditionalClassesAtCycleStart()
        {
            var student = new backend_proyecto.Models.Student
            {
                AdditionalClasses = 20
            };

            student.AdditionalClasses = 0;

            Assert.Equal(0, student.AdditionalClasses);
        }
    }
}
