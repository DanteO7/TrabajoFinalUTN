using backend_proyecto.Config;
using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Repositories
{
    public interface IInvitationRepository : IRepository<Invitation> { }
    public class InvitationRepository : Repository<Invitation>, IInvitationRepository
    {
        private readonly ApplicationDbContext _db;
        public InvitationRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
