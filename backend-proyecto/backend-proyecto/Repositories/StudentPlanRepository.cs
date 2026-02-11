using backend_proyecto.Config;
using backend_proyecto.Models;

namespace backend_proyecto.Repositories
{
    public interface IStudentPlanRepository : IRepository<StudentPlan> { }
    public class StudentPlanRepository : Repository<StudentPlan>, IStudentPlanRepository
    {
        private readonly ApplicationDbContext _db;
        public StudentPlanRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
