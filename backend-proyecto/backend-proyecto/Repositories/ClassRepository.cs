using backend_proyecto.Config;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Repositories
{
    public interface IClassRepository : IRepository<Class>
    {
        Task<bool> ExistsScheduleConflict(CreateClassDTO createClassDTO);
    }
    public class ClassRepository : Repository<Class>, IClassRepository
    {
        private readonly ApplicationDbContext _db;
        public ClassRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public async Task<bool> ExistsScheduleConflict(CreateClassDTO createClassDTO)
        {
            return await dbSet.AnyAsync(c =>
            c.ProfessorId == createClassDTO.ProfessorId &&
            c.Date.Date == createClassDTO.Date.Date &&
            createClassDTO.StartTime < c.EndTime &&
            createClassDTO.EndTime > c.StartTime
            );
        }
    }
}
