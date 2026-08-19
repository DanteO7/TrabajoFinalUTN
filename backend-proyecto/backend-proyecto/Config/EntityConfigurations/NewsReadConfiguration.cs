using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class NewsReadConfiguration : IEntityTypeConfiguration<NewsRead>
{
    public void Configure(EntityTypeBuilder<NewsRead> entity)
    {
        entity.HasKey(nr => nr.Id);

        entity.Property(nr => nr.ReadAt)
            .IsRequired();

        entity.HasIndex(nr => new
            {
                nr.NewsId,
                nr.UserId
            })
        .IsUnique();

        entity.HasOne(nr => nr.News)
            .WithMany(n => n.Reads)
            .HasForeignKey(nr => nr.NewsId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(nr => nr.User)
            .WithMany()
            .HasForeignKey(nr => nr.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}