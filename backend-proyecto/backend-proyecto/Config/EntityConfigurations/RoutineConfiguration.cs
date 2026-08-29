using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class RoutineConfiguration : IEntityTypeConfiguration<Routine>
    {
        public void Configure(EntityTypeBuilder<Routine> entity)
        {
            entity.HasKey(r => r.Id);

            entity.Property(r => r.Name)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(r => r.Description)
                  .HasMaxLength(300)
                  .IsRequired(false);

            entity.HasOne(r => r.Tenant)
                  .WithMany()
                  .HasForeignKey(r => r.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(r => new { r.TenantId, r.Name })
                  .IsUnique();
        }
    }
}