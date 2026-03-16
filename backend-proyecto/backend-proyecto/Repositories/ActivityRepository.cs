using backend_proyecto.Config;
using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Repositories
{
    public interface IActivityRepository : IRepository<Activity>
    {
        Task<bool> ExistsByName(string name);
    }
    public class ActivityRepository : Repository<Activity>, IActivityRepository
    {
        private readonly ApplicationDbContext _db;
        public ActivityRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public async Task<bool> ExistsByName(string name)
        {
            return await dbSet.AnyAsync(s => s.Name.ToLower() == name.ToLower());
        }
    }
}
