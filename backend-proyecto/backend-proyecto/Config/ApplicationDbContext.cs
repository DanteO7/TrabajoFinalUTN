using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;

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
        public DbSet<ProfessorSpeciality> ProfessorSpecialities { get; set; }
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
                      .HasPrecision(18, 2);
            });

            modelBuilder.Entity<Student>(entity =>
            {
                entity.HasKey(s => s.Id);

                entity.HasOne(s => s.User)
                      .WithMany()
                      .HasForeignKey(s => s.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Tenant)
                      .WithMany()
                      .HasForeignKey(s => s.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.StudentPlan)
                      .WithMany()
                      .HasForeignKey(s => s.StudentPlanId);
            });

            modelBuilder.Entity<Professor>(entity =>
            {
                entity.HasKey(p => p.Id);

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

                entity.HasOne(c => c.Professor)
                      .WithMany()
                      .HasForeignKey(c => c.ProfessorId)
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
                      .HasPrecision(18, 2);
            });

            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.HasOne(r => r.Tenant)
                      .WithMany()
                      .HasForeignKey(r => r.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Student)
                      .WithMany()
                      .HasForeignKey(p => p.StudentId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r=> r.Class)
                      .WithMany(c => c.Reservations)
                      .HasForeignKey(r=> r.ClassId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TenantPlan>(entity =>
            {
                entity.Property(p => p.Price)
                      .HasPrecision(18, 2);
            });

            modelBuilder.Entity<ProfessorSpeciality>(entity =>
            {
                entity.HasKey(ps => new { ps.ProfessorId, ps.SpecialityId });

                entity.HasOne(ps => ps.Professor)
                      .WithMany(p => p.ProfessorSpecialities)
                      .HasForeignKey(ps => ps.ProfessorId);

                entity.HasOne(ps => ps.Speciality)
                      .WithMany()
                      .HasForeignKey(ps => ps.SpecialityId);
            });

            modelBuilder.Entity<Admin>(entity =>
            {
                entity.HasKey(p => p.Id);

                entity.HasOne(p => p.User)
                      .WithMany()
                      .HasForeignKey(p => p.UserId)
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
