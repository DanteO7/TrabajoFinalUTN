using backend_proyecto.Config;
using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Repositories
{
    public interface IActivityRepository : IRepository<Activity>
    {
        Task<bool> ExistsByName(string name, int tenantId);
    }

    public class ActivityRepository : Repository<Activity>, IActivityRepository
    {
        private readonly ApplicationDbContext _db;

        public ActivityRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public async Task<bool> ExistsByName(string name, int tenantId)
        {
            return await dbSet.AnyAsync(s =>
                s.Name.ToLower() == name.ToLower() &&
                s.TenantId == tenantId);
        }
    }
}
