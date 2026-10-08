
using backend_proyecto.Config;
using backend_proyecto.Models;

namespace backend_proyecto.Repositories
{
    public interface IClassTemplateStudentRepository : IRepository<ClassTemplateStudent> { }
    public class ClassTemplateStudentRepository : Repository<ClassTemplateStudent>, IClassTemplateStudentRepository
    {
        private readonly ApplicationDbContext _db;

        public ClassTemplateStudentRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}