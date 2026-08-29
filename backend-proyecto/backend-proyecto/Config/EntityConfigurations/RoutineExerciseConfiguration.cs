using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend_proyecto.Config.EntityConfigurations
{
    public class RoutineExerciseConfiguration : IEntityTypeConfiguration<RoutineExercise>
    {
        public void Configure(EntityTypeBuilder<RoutineExercise> entity)
        {
            entity.HasKey(re => re.Id);

            entity.Property(re => re.Sets)
                  .IsRequired();

            entity.Property(re => re.Repetitions)
                  .IsRequired();

            entity.Property(re => re.Weight)
                  .HasPrecision(10, 2)
                  .IsRequired(false);

            entity.Property(re => re.Order)
                  .IsRequired();

            entity.HasOne(re => re.Routine)
                  .WithMany(r => r.RoutineExercises)
                  .HasForeignKey(re => re.RoutineId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Exercise)
                  .WithMany(x => x.RoutineExercises)
                  .HasForeignKey(x => x.ExerciseId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(re => new
            {
                re.RoutineId,
                re.Order
            })
            .IsUnique();
        }
    }
}