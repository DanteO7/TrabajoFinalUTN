using backend_proyecto.Config;
using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Repositories
{
    public interface ISpecialityRepository : IRepository<Speciality>
    {
        Task<bool> ExistsByName(string name);
    }
    public class SpecialityRepository : Repository<Speciality>, ISpecialityRepository
    {
        private readonly ApplicationDbContext _db;
        public SpecialityRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public async Task<bool> ExistsByName(string name)
        {
            return await dbSet.AnyAsync(s => s.Name.ToLower() == name.ToLower());
        }
    }
}
