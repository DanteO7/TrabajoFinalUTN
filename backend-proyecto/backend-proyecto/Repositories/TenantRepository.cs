using backend_proyecto.Config;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

public interface ITenantRepository : IRepository<Tenant>
{
    Task<bool> ExistsByUserId(int userId);
    Task<bool> ExistsByOwnerAndId(int userId, int tenantId);
    Task<List<ResponseMyTenantDTO>> GetMyTenants(int currentUserId, int? targetUserId = null);
    Task<int> CountAsync(Expression<Func<Tenant, bool>> predicate);
    Task ResetMonthlyFeeStatusAsync(
            DateTime date,
            CancellationToken cancellationToken = default
        );

    Task SetPendingToOverdueAsync(
        DateTime date,
        CancellationToken cancellationToken = default
    );
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

    public async Task<bool> ExistsByOwnerAndId(int userId, int tenantId)
    {
        return await dbSet.AnyAsync(t => t.OwnerUserId == userId && t.Id == tenantId);
    }

    public async Task<List<ResponseMyTenantDTO>> GetMyTenants(int currentUserId, int? targetUserId = null)
    {
        var userId = targetUserId ?? currentUserId;

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
                Address = t.Address,
            })
            .ToListAsync();

        return tenants;
    }
    public async Task<int> CountAsync(Expression<Func<Tenant, bool>> predicate)
    {
        return await _db.Tenants.CountAsync(predicate);
    }
    public async Task ResetMonthlyFeeStatusAsync(
            DateTime date,
            CancellationToken cancellationToken = default)
    {
        await _db.Tenants
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(
                        t => t.MonthlyFeeStatus,
                        MonthlyFeeStatus.PENDING
                    )
                    .SetProperty(
                        t => t.MonthlyFeeStatusUpdatedAt,
                        date
                    ),
                cancellationToken
            );
    }

    public async Task SetPendingToOverdueAsync(
        DateTime date,
        CancellationToken cancellationToken = default)
    {
        await _db.Tenants
            .Where(t =>
                t.MonthlyFeeStatus == MonthlyFeeStatus.PENDING
            )
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(
                        t => t.MonthlyFeeStatus,
                        MonthlyFeeStatus.OVERDUE
                    )
                    .SetProperty(
                        t => t.MonthlyFeeStatusUpdatedAt,
                        date
                    ),
                cancellationToken
            );
    }
}