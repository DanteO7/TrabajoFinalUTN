using Microsoft.EntityFrameworkCore;
using backend_proyecto.Models;

namespace backend_proyecto.Config
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Tenant> Tenants { get; set; } = null!;
        public DbSet<User> User { get; set; } = null!;
        public DbSet<Student> Students { get; set; } = null!;
        public DbSet<Professor> Professors { get; set; } = null!;
        public DbSet<Speciality> Specialities { get; set; } = null!;
        public DbSet<Activity> Activities { get; set; } = null!;
        public DbSet<StudentPlan> StudentPlans { get; set; } = null!;
        public DbSet<TenantPlan> TenantPlans { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<Class> Classes { get; set; } = null!;
        public DbSet<Reservation> Reservations { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<StudentPlan>(entity =>
            {
                entity.HasOne(p => p.Tenant)
                      .WithMany()
                      .HasForeignKey(p => p.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.Property(p => p.Price)
                      .HasPrecision(10, 2);
            });

            modelBuilder.Entity<Student>(entity =>
            {
                entity.HasKey(s => new { s.UserId, s.TenantId });

                entity.HasOne(s => s.User)
                      .WithMany()
                      .HasForeignKey(s => s.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Tenant)
                      .WithMany()
                      .HasForeignKey(s => s.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Plan)
                      .WithMany()
                      .HasForeignKey(s => s.PlanId);
            });

            modelBuilder.Entity<Professor>(entity =>
            {
                entity.HasKey(p => new { p.UserId, p.TenantId });

                entity.HasOne(p => p.User)
                      .WithMany()
                      .HasForeignKey(p => p.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Tenant)
                      .WithMany()
                      .HasForeignKey(p => p.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Class>(entity =>
            {
                entity.HasOne(c => c.Tenant)
                      .WithMany()
                      .HasForeignKey(c => c.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.ProfessorUser)
                      .WithMany()
                      .HasForeignKey(c => c.ProfessorUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Activity)
                      .WithMany()
                      .HasForeignKey(c => c.ActivityId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasOne(p => p.Tenant)
                      .WithMany()
                      .HasForeignKey(p => p.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.User)
                      .WithMany()
                      .HasForeignKey(p => p.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.Property(p => p.Amount)
                      .HasPrecision(10, 2);
            });

            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.HasOne(r => r.Tenant)
                      .WithMany()
                      .HasForeignKey(r => r.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.StudentUser)
                      .WithMany()
                      .HasForeignKey(p => p.StudentUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r=> r.Class)
                      .WithMany()
                      .HasForeignKey(r=> r.ClassId)
                      .OnDelete(DeleteBehavior.Restrict);
            });


            //modelBuilder.Entity<User>().HasData(
            //    new User
            //    {
            //        Id = 1,
            //        Name = "Admin",
            //        Surname = "User",
            //        Email = "user@example.com",
            //        Password = "stringst",
            //        PhoneNumber = "1234567890"
            //    });
        }
    }
}
