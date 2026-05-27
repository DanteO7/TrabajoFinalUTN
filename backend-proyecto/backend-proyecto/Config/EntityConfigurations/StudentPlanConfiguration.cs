using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class StudentPlanConfiguration : IEntityTypeConfiguration<StudentPlan>
    {
        public void Configure(EntityTypeBuilder<StudentPlan> entity)
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(50);
            entity.Property(p => p.ClassesPerMonth).IsRequired();
            entity.Property(p => p.Price).IsRequired().HasPrecision(18, 2);

            entity.HasOne(p => p.Tenant)
                  .WithMany()
                  .HasForeignKey(p => p.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
