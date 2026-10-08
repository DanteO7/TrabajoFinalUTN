using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class ClassTemplateStudentConfiguration : IEntityTypeConfiguration<ClassTemplateStudent>
    {
        public void Configure(EntityTypeBuilder<ClassTemplateStudent> entity)
        {
            entity.HasKey(cts => new
            {
                cts.ClassTemplateId,
                cts.StudentId
            });

            entity.HasOne(cts => cts.ClassTemplate)
                  .WithMany(ct => ct.Students)
                  .HasForeignKey(cts => cts.ClassTemplateId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(cts => cts.Student)
                  .WithMany()
                  .HasForeignKey(cts => cts.StudentId)
                  .OnDelete(DeleteBehavior.Cascade);
        }
    }
}