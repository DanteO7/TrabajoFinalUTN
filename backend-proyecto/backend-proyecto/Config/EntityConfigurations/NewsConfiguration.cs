using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class NewsConfiguration : IEntityTypeConfiguration<News>
    {
        public void Configure(EntityTypeBuilder<News> entity)
        {
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Title).IsRequired().HasMaxLength(100);

            entity.Property(n => n.Content)
                  .HasMaxLength(2000)
                  .IsRequired();

            entity.Property(n => n.CreatedAt)
                   .IsRequired();

            entity.HasOne(n => n.Tenant)
                  .WithMany()
                  .HasForeignKey(n => n.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(n => n.CreatedByUser)
                  .WithMany()
                  .HasForeignKey(n => n.CreatedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(n => n.Reads)
                   .WithOne(nr => nr.News)
                   .HasForeignKey(nr => nr.NewsId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
