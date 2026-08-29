using backend_proyecto.Config;
using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Repositories
{
    public interface IRoutineRepository : IRepository<Routine>
    {
        Task<bool> ExistsByName(string name, int tenantId);
        Task<List<Routine>> GetAllByTenantIdAsync(int tenantId);
        Task<Routine?> GetOneWithExercisesAsync(int id);
    }

    public class RoutineRepository : Repository<Routine>, IRoutineRepository
    {
        private readonly ApplicationDbContext _db;

        public RoutineRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public async Task<bool> ExistsByName(string name, int tenantId)
        {
            return await _db.Routines.AnyAsync(
                r => r.Name == name &&
                     r.TenantId == tenantId
            );
        }
        public async Task<List<Routine>> GetAllByTenantIdAsync(int tenantId)
        {
            return await _db.Routines
                .Where(r => r.TenantId == tenantId)
                .Include(r => r.RoutineExercises)
                    .ThenInclude(re => re.Exercise)
                .ToListAsync();
        }
        public async Task<Routine?> GetOneWithExercisesAsync(int id)
        {
            return await _db.Routines
                .Include(r => r.RoutineExercises)
                    .ThenInclude(re => re.Exercise)
                .FirstOrDefaultAsync(r => r.Id == id);
        }
    }
}