using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class EmailVerificationConfiguration : IEntityTypeConfiguration<EmailVerification>
    {
        public void Configure(EntityTypeBuilder<EmailVerification> entity)
        {
            entity.HasKey(ev => ev.Id);

            entity.Property(ev => ev.Email)
                  .IsRequired()
                  .HasMaxLength(100);

            entity.Property(ev => ev.Code)
                  .IsRequired()
                  .HasMaxLength(6);

            entity.Property(ev => ev.ExpiresAt)
                  .IsRequired();

            entity.Property(ev => ev.Used)
                  .IsRequired();

            entity.Property(ev => ev.CreatedAt)
                  .IsRequired();

            entity.HasIndex(ev => ev.Email);
        }
    }
}