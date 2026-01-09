using Microsoft.EntityFrameworkCore;
using backend_proyecto.Models;

namespace backend_proyecto.Config
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Person> Persons { get; set; } = null!;
        public DbSet<Student> Students { get; set; } = null!;
        public DbSet<Professor> Professors { get; set; } = null!;
        public DbSet<Speciality> Specialities { get; set; } = null!;
        public DbSet<Activity> Activities { get; set; } = null!;
        public DbSet<Plan> Plans { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<Class> Classes { get; set; } = null!;
        public DbSet<Reservation> Reservations { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.StudentPerson)
                .WithMany()
                .HasForeignKey(r => r.StudentPersonId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.Property(p => p.Amount)
                      .HasPrecision(10, 2);
            });

            modelBuilder.Entity<Plan>(entity =>
            {
                entity.Property(p => p.Price)
                      .HasPrecision(10, 2);
            });

            modelBuilder.Entity<Person>().HasData(
                new Person
                {
                    Id = 1,
                    Name = "Admin",
                    Surname = "User",
                    Email = "admin@example.com",
                    Password = "Admin@123",
                    PhoneNumber = "1234567890"
                });
        }
    }
}
