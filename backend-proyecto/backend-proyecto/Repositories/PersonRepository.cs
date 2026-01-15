using backend_proyecto.Config;
using backend_proyecto.Models;

namespace backend_proyecto.Repositories
{
    public interface IuserRepository : IRepository<User> { }
    public class userRepository : Repository<User>, IuserRepository
    {
        private readonly ApplicationDbContext _db;
        public userRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
