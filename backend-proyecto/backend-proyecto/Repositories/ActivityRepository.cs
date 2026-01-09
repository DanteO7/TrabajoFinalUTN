using backend_proyecto.Config;
using backend_proyecto.Models;

namespace backend_proyecto.Repositories
{
    public interface IActivityRepository : IRepository<Activity> { }
    public class ActivityRepository : Repository<Activity>, IActivityRepository
    {
        private readonly ApplicationDbContext _db;
        public ActivityRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
