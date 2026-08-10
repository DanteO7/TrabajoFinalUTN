using backend_proyecto.Config;
using backend_proyecto.Models;

namespace backend_proyecto.Repositories
{
    public interface IWaitlistRepository : IRepository<Waitlist> { }

    public class WaitlistRepository
        : Repository<Waitlist>, IWaitlistRepository
    {
        public WaitlistRepository(ApplicationDbContext db)
            : base(db)
        {
        }
    }
}