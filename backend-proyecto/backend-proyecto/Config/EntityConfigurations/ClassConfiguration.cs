using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class ClassConfiguration : IEntityTypeConfiguration<Class>
    {
        public void Configure(EntityTypeBuilder<Class> entity)
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.MaxCapacity).IsRequired();
            entity.Property(c => c.StartTime).HasColumnType("time");
            entity.Property(c => c.EndTime).HasColumnType("time");

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
                  .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
