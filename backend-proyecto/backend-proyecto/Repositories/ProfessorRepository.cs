using backend_proyecto.Config;
using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Repositories
{
    public interface IProfessorRepository
    {
        Task<bool> ExistsByUserId(int userId);
    }
    public class ProfessorRepository : IProfessorRepository
    {
        private readonly ApplicationDbContext _db;
        internal DbSet<Professor> dbSet { get; set; } = null!;

        public ProfessorRepository(ApplicationDbContext db)
        {
            _db = db;
            dbSet = _db.Set<Professor>();
        }
        public async Task<bool> ExistsByUserId(int userId)
        {
            return await dbSet.AnyAsync(p => p.UserId == userId);
        }
    }
}
