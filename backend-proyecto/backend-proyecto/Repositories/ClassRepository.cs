using backend_proyecto.Config;
using backend_proyecto.Models;

namespace backend_proyecto.Repositories
{
    public interface IClassRepository : IRepository<Class> { }
    public class ClassRepository : Repository<Class>, IClassRepository
    {
        private readonly ApplicationDbContext _db;
        public ClassRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
