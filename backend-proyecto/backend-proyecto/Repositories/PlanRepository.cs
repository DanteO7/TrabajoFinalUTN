using backend_proyecto.Config;
using backend_proyecto.Models;

namespace backend_proyecto.Repositories
{
    public interface IPlanRepository : IRepository<Plan> { }
    public class PlanRepository : Repository<Plan>, IPlanRepository
    {
        private readonly ApplicationDbContext _db;
        public PlanRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
