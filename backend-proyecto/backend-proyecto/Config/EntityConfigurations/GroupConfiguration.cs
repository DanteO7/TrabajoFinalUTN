using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class GroupConfiguration : IEntityTypeConfiguration<Group>
    {
        public void Configure(EntityTypeBuilder<Group> entity)
        {
            entity.HasKey(g => g.Id);
            entity.Property(g => g.Name).IsRequired().HasMaxLength(50);
            entity.HasIndex(g => new { g.Name, g.TenantId }).IsUnique();

            entity.HasOne(g => g.Tenant)
                  .WithMany()
                  .HasForeignKey(g => g.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
