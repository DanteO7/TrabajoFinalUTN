using backend_proyecto.Config;
using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Repositories
{
    public interface IProfessorRepository : IRepository<Professor>
    {
        Task<bool> ExistsByUserId(int userId);
    }
    public class ProfessorRepository : Repository<Professor>, IProfessorRepository
    {
        private readonly ApplicationDbContext _db;

        public ProfessorRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public async Task<bool> ExistsByUserId(int userId)
        {
            return await dbSet.AnyAsync(p => p.UserId == userId);
        }
    }
}
