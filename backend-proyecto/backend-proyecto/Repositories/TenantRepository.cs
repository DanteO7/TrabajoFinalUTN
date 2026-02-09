using backend_proyecto.Config;
using backend_proyecto.Models;

namespace backend_proyecto.Repositories
{
    public interface ITenantRepository : IRepository<Tenant> { }
    public class TenantRepository : Repository<Tenant>, ITenantRepository
    {
        private readonly ApplicationDbContext _db;
        public TenantRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
