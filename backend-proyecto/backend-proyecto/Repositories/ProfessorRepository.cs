using backend_proyecto.Config;
using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Repositories
{
    public interface IProfessorRepository : IRepository<Professor>
    {
        Task<bool> ExistsByUserId(int userId);
        Task<bool> HasSpeciality(int professorId, int specialityId);
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
        public async Task<bool> HasSpeciality(int professorId, int specialityId)
        {
            return await _db.ProfessorSpecialities.AnyAsync(ps => ps.ProfessorId == professorId && ps.SpecialityId == specialityId);
        }
    }
}
