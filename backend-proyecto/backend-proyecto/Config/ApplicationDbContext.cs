using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Config
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Tenant> Tenants { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Student> Students { get; set; } = null!;
        public DbSet<Professor> Professors { get; set; } = null!;
        public DbSet<Speciality> Specialities { get; set; } = null!;
        public DbSet<ProfessorSpeciality> ProfessorSpecialities { get; set; } = null!;
        public DbSet<Activity> Activities { get; set; } = null!;
        public DbSet<StudentPlan> StudentPlans { get; set; } = null!;
        public DbSet<TenantPlan> TenantPlans { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<Class> Classes { get; set; } = null!;
        public DbSet<Reservation> Reservations { get; set; } = null!;
        public DbSet<Group> Groups { get; set; } = null!;
        public DbSet<Permission> Permissions { get; set; } = null!;
        public DbSet<UserGroup> UserGroups { get; set; } = null!;
        public DbSet<GroupPermission> GroupPermissions { get; set; } = null!;
        public DbSet<EmailVerification> EmailVerifications { get; set; }
        public DbSet<PasswordReset> PasswordResets { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            PermissionSeeder.Seed(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }
    }
}