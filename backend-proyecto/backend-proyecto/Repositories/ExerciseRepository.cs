using backend_proyecto.Config;
using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Repositories
{
    public interface IExerciseRepository : IRepository<Exercise>
    {
        Task<bool> ExistsByName(string name, int tenantId);
    }

    public class ExerciseRepository : Repository<Exercise>, IExerciseRepository
    {
        private readonly ApplicationDbContext _db;

        public ExerciseRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public async Task<bool> ExistsByName(string name, int tenantId)
        {
            return await _db.Exercises.AnyAsync(
                e => e.Name == name &&
                     e.TenantId == tenantId
            );
        }
    }
}