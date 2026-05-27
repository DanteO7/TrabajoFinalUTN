using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class TenantPlanConfiguration : IEntityTypeConfiguration<TenantPlan>
    {
        public void Configure(EntityTypeBuilder<TenantPlan> entity)
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(50);
            entity.Property(p => p.Price).IsRequired().HasPrecision(18, 2);
            entity.Property(p => p.MaxStudents).IsRequired();
            entity.Property(p => p.MaxProfessors).IsRequired();
        }
    }
}
