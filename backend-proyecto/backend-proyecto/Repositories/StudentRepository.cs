using backend_proyecto.Config;
using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Repositories
{
    public interface IStudentRepository
    {
        Task<bool> ExistsByUserId(int userId);
    }
    public class StudentRepository : IStudentRepository
    {
        private readonly ApplicationDbContext _db;
        internal DbSet<Student> dbSet { get; set; } = null!;

        public StudentRepository(ApplicationDbContext db)
        {
            _db = db;
            dbSet = _db.Set<Student>();
        }
        public async Task<bool> ExistsByUserId(int userId)
        {
            return await dbSet.AnyAsync(s => s.UserId == userId);
        }
    }
}
