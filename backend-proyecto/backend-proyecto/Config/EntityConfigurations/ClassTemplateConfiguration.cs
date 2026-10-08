using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class ClassTemplateConfiguration : IEntityTypeConfiguration<ClassTemplate>
    {
        public void Configure(EntityTypeBuilder<ClassTemplate> entity)
        {
            entity.HasKey(ct => ct.Id);

            entity.HasOne(ct => ct.Tenant)
                  .WithMany()
                  .HasForeignKey(ct => ct.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ct => ct.Activity)
                  .WithMany()
                  .HasForeignKey(ct => ct.ActivityId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ct => ct.Professor)
                  .WithMany()
                  .HasForeignKey(ct => ct.ProfessorId)
                  .OnDelete(DeleteBehavior.Restrict);
        }
    }
}