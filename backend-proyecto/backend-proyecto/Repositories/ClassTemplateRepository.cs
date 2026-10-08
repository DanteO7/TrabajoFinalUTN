using backend_proyecto.Config;
using backend_proyecto.Models;

namespace backend_proyecto.Repositories
{
    public interface IClassTemplateRepository : IRepository<ClassTemplate> { }
    public class ClassTemplateRepository : Repository<ClassTemplate>, IClassTemplateRepository
    {
        private readonly ApplicationDbContext _db;

        public ClassTemplateRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}