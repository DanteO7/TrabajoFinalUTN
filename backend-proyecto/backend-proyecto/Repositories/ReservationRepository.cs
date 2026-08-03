using backend_proyecto.Config;
using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace backend_proyecto.Repositories
{
    public interface IReservationRepository : IRepository<Reservation>
    {
        Task<int> CountByClassId(int classId);
        Task<int> CountAsync(Expression<Func<Reservation, bool>> predicate);
    }
    public class ReservationRepository : Repository<Reservation>, IReservationRepository
    {
        private readonly ApplicationDbContext _db;
        public ReservationRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public async Task<int> CountByClassId(int classId)
        {
            return await _db.Set<Reservation>().CountAsync(r => r.ClassId == classId);
        }
        public async Task<int> CountAsync(Expression<Func<Reservation, bool>> predicate)
        {
            return await _db.Reservations.CountAsync(predicate);
        }
    }
}
