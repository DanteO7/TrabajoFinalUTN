using backend_proyecto.Config;
using backend_proyecto.Models;

namespace backend_proyecto.Repositories
{
    public interface ITenantPlanRepository : IRepository<TenantPlan> { }
    public class TenantPlanRepository : Repository<TenantPlan>, ITenantPlanRepository
    {
        private readonly ApplicationDbContext _db;
        public TenantPlanRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
