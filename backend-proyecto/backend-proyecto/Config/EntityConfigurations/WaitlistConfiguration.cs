using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Reflection.Emit;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class WaitlistConfiguration : IEntityTypeConfiguration<Waitlist>
    {
        public void Configure(EntityTypeBuilder<Waitlist> entity)
        {
            entity.HasOne(w => w.Class)
                .WithMany(c => c.Waitlists)
                .HasForeignKey(w => w.ClassId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(w => w.Student)
                .WithMany(s => s.Waitlists)
                .HasForeignKey(w => w.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(w => new { w.ClassId, w.StudentId })
                .IsUnique();
        }
    }
}
