using backend_proyecto.Config;
using backend_proyecto.Models;
using backend_proyecto.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

public interface IStudentRepository : IRepository<Student>
{
    Task<bool> ExistsByUserId(int userId);
    Task<bool> ExistsByUserAndTenant(int userId, int tenantId);
    Task<int> CountAsync(Expression<Func<Student, bool>> predicate);
}

public class StudentRepository : Repository<Student>, IStudentRepository
{
    private readonly ApplicationDbContext _db;

    public StudentRepository(ApplicationDbContext db) : base(db)
    {
        _db = db;
    }

    public async Task<bool> ExistsByUserId(int userId)
    {
        return await dbSet.AnyAsync(s => s.UserId == userId);
    }

    public async Task<bool> ExistsByUserAndTenant(int userId, int tenantId)
    {
        return await dbSet.AnyAsync(s => s.UserId == userId && s.TenantId == tenantId);
    }
    public async Task<int> CountAsync(Expression<Func<Student, bool>> predicate)
    {
        return await _db.Students.CountAsync(predicate);
    }
}