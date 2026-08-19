using backend_proyecto.Config;
using backend_proyecto.Models;

namespace backend_proyecto.Repositories
{
    public interface INewsReadRepository : IRepository<NewsRead> { }
    public class NewsReadRepository : Repository<NewsRead>, INewsReadRepository
    {
        private readonly ApplicationDbContext _db;
        public NewsReadRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
