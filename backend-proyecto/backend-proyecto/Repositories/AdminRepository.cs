using backend_proyecto.Config;
using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Repositories
{
    public interface IAdminRepository : IRepository<Admin>
    {
        Task<bool> ExistsByUserId(int userId);
    }
    public class AdminRepository : Repository<Admin>, IAdminRepository
    {
        private readonly ApplicationDbContext _db;

        public AdminRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public async Task<bool> ExistsByUserId(int userId)
        {
            return await dbSet.AnyAsync(s => s.UserId == userId);
        }
    }
}
