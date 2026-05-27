using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class ProfessorSpecialityConfiguration : IEntityTypeConfiguration<ProfessorSpeciality>
    {
        public void Configure(EntityTypeBuilder<ProfessorSpeciality> entity)
        {
            entity.HasKey(ps => new { ps.ProfessorId, ps.SpecialityId });

            entity.HasOne(ps => ps.Professor)
                  .WithMany(p => p.ProfessorSpecialities)
                  .HasForeignKey(ps => ps.ProfessorId);

            entity.HasOne(ps => ps.Speciality)
                  .WithMany()
                  .HasForeignKey(ps => ps.SpecialityId);
        }
    }
}
