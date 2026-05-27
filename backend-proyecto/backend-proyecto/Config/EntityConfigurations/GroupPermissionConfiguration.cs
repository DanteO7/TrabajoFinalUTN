using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class GroupPermissionConfiguration : IEntityTypeConfiguration<GroupPermission>
    {
        public void Configure(EntityTypeBuilder<GroupPermission> entity)
        {
            entity.HasKey(gp => new { gp.GroupId, gp.PermissionId });

            entity.HasOne(gp => gp.Group)
                  .WithMany(g => g.GroupPermissions)
                  .HasForeignKey(gp => gp.GroupId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(gp => gp.Permission)
                  .WithMany(p => p.GroupPermissions)
                  .HasForeignKey(gp => gp.PermissionId)
                  .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
