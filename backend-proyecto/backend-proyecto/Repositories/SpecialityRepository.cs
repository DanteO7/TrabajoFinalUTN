using backend_proyecto.Config;
using backend_proyecto.Models;

namespace backend_proyecto.Repositories
{
    public interface ISpecialityRepository : IRepository<Speciality> { }
    public class SpecialityRepository : Repository<Speciality>, ISpecialityRepository
    {
        private readonly ApplicationDbContext _db;
        public SpecialityRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
