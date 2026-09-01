using backend_proyecto.Config;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

public interface IStudentRepository : IRepository<Student>
{
    Task<bool> ExistsByUserId(int userId);
    Task<bool> ExistsByUserAndTenant(int userId, int tenantId);
    Task<int> CountAsync(Expression<Func<Student, bool>> predicate);
    Task ResetMonthlyFeeStatusAsync(
            DateTime date,
            CancellationToken cancellationToken = default
        );

    Task SetPendingToOverdueAsync(
        DateTime date,
        CancellationToken cancellationToken = default
    );
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
    public async Task ResetMonthlyFeeStatusAsync(
            DateTime date,
            CancellationToken cancellationToken = default)
    {
        await _db.Students
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(
                        s => s.MonthlyFeeStatus,
                        MonthlyFeeStatus.PENDING
                    )
                    .SetProperty(
                        s => s.MonthlyFeeStatusUpdatedAt,
                        date
                    ),
                cancellationToken
            );
    }

    public async Task SetPendingToOverdueAsync(
        DateTime date,
        CancellationToken cancellationToken = default)
    {
        await _db.Students
            .Where(s =>
                s.MonthlyFeeStatus == MonthlyFeeStatus.PENDING
            )
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(
                        s => s.MonthlyFeeStatus,
                        MonthlyFeeStatus.OVERDUE
                    )
                    .SetProperty(
                        s => s.MonthlyFeeStatusUpdatedAt,
                        date
                    ),
                cancellationToken
            );
    }
}
