using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Reflection.Emit;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class ProfessorPermissionConfiguration : IEntityTypeConfiguration<ProfessorPermission>
    {
        public void Configure(EntityTypeBuilder<ProfessorPermission> entity)
        {
            entity.HasKey(pp => new
                {
                    pp.ProfessorId,
                    pp.PermissionId
                });

            entity.HasOne(pp => pp.Professor)
                  .WithMany(p => p.ProfessorPermissions)
                  .HasForeignKey(pp => pp.ProfessorId);

            entity.HasOne(pp => pp.Permission)
                  .WithMany()
                  .HasForeignKey(pp => pp.PermissionId);
        }
    }
}
