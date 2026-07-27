using backend_proyecto.Config;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Repositories
{
    public interface IClassRepository : IRepository<Class>
    {
        Task<bool> ExistsScheduleConflict(CreateClassDTO dto, int? classIdToIgnore);
    }
    public class ClassRepository : Repository<Class>, IClassRepository
    {
        private readonly ApplicationDbContext _db;
        public ClassRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public async Task<bool> ExistsScheduleConflict(CreateClassDTO dto, int? classIdToIgnore = null)
        {
            return await _db.Classes.AnyAsync(c =>
                c.ProfessorId == dto.ProfessorId &&
                c.Date == dto.Date &&
                dto.StartTime < c.EndTime &&
                dto.EndTime > c.StartTime &&
                (classIdToIgnore == null || c.Id != classIdToIgnore)
            );
        }
    }
}
