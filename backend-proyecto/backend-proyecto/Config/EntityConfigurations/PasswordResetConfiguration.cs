using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class PasswordResetConfiguration : IEntityTypeConfiguration<PasswordReset>
    {
        public void Configure(EntityTypeBuilder<PasswordReset> entity)
        {
            entity.HasKey(pr => pr.Id);

            entity.Property(pr => pr.Email)
                  .IsRequired()
                  .HasMaxLength(100);

            entity.Property(pr => pr.Token)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(pr => pr.ExpiresAt)
                  .IsRequired();

            entity.Property(pr => pr.Used)
                  .IsRequired();

            entity.Property(pr => pr.CreatedAt)
                  .IsRequired();

            entity.HasIndex(pr => pr.Email);
        }
    }
}