using backend_proyecto.Config;
using backend_proyecto.Models;

namespace backend_proyecto.Repositories
{
    public interface IReservationRepository : IRepository<Reservation> { }
    public class ReservationRepository : Repository<Reservation>, IReservationRepository
    {
        private readonly ApplicationDbContext _db;
        public ReservationRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
