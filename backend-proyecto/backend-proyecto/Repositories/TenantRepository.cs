using backend_proyecto.Config;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Repositories
{
    public interface ITenantRepository : IRepository<Tenant>
    {
        Task<bool> ExistsByUserId(int userId);
        Task<List<ResponseMyTenantDTO>> GetMyTenants(int userId);

    }
    public class TenantRepository : Repository<Tenant>, ITenantRepository
    {
        private readonly ApplicationDbContext _db;
        public TenantRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public async Task<bool> ExistsByUserId(int userId)
        {
            return await dbSet.AnyAsync(s => s.OwnerUserId == userId);
        }
        public async Task<List<ResponseMyTenantDTO>> GetMyTenants(int userId)
        {
            var tenants = await _db.Tenants
                .Where(t =>
                    t.OwnerUserId == userId ||
                    t.Professors.Any(p => p.UserId == userId) ||
                    t.Students.Any(s => s.UserId == userId)
                )
                .Select(t => new ResponseMyTenantDTO
                {
                    Id = t.Id,
                    Name = t.Name,

                    Role = t.OwnerUserId == userId
                        ? "Owner"
                        : t.Professors.Any(p => p.UserId == userId)
                            ? "Professor"
                            : "Student",

                    OwnerName = t.OwnerUser.Name + " " + t.OwnerUser.Surname,
                    IsActive = t.IsActive,
                })
                .ToListAsync();

            return tenants;
        }
    }
}
