using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
    {
        public void Configure(EntityTypeBuilder<Tenant> entity)
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Name).IsRequired().HasMaxLength(50);
            entity.Property(t => t.IsActive).IsRequired();
            entity.Property(t => t.MonthlyFeeStatus).IsRequired();

            entity.HasOne(t => t.OwnerUser)
                  .WithMany()
                  .HasForeignKey(t => t.OwnerUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.TenantPlan)
                  .WithMany()
                  .HasForeignKey(t => t.TenantPlanId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(t => t.Professors)
                  .WithOne(p => p.Tenant)
                  .HasForeignKey(p => p.TenantId)
                  .OnDelete(DeleteBehavior.Restrict); ;

            entity.HasMany(t => t.Students)
                  .WithOne(s => s.Tenant)
                  .HasForeignKey(s => s.TenantId)
                  .OnDelete(DeleteBehavior.Restrict); ;

            entity.HasIndex(t => new { t.OwnerUserId, t.Name }).IsUnique();
        }
    }
}
