using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class InvitationConfiguration : IEntityTypeConfiguration<Invitation>
    {
        public void Configure(EntityTypeBuilder<Invitation> entity)
        {
            entity.HasKey(i => i.Id);

            entity.HasIndex(i => i.Token)
                  .IsUnique();

            entity.Property(i => i.Role)
                  .HasMaxLength(20)
                  .IsRequired();

            entity.HasOne(i => i.Tenant)
                  .WithMany()
                  .HasForeignKey(i => i.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);
        }
    }
}