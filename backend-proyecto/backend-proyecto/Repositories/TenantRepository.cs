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
    Task<List<ResponseMyTenantDTO>> GetMyTenants(int currentUserId, int? targetUserId = null, bool onlyOwned = false);
    Task<int> CountAsync(Expression<Func<Tenant, bool>> predicate);
    Task<Tenant?> GetByMercadoPagoUserIdAsync(
    string mercadoPagoUserId);

    Task<List<Tenant>> GetMyOwnedTenants(int userId);
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

    public async Task<List<ResponseMyTenantDTO>> GetMyTenants(
    int currentUserId,
    int? targetUserId = null,
    bool onlyOwned = false)
    {
        var userId = targetUserId ?? currentUserId;

        var query = _db.Tenants.AsQueryable();

        if (onlyOwned)
        {
            query = query.Where(t =>
                t.OwnerUserId == userId
            );
        }
        else
        {
            query = query.Where(t =>
                t.OwnerUserId == userId ||
                t.Professors.Any(p => p.UserId == userId) ||
                t.Students.Any(s => s.UserId == userId)
            );
        }

        var tenants =
            await query
                .Select(t => new ResponseMyTenantDTO
                {
                    Id = t.Id,
                    Name = t.Name,
                    Role = t.OwnerUserId == userId
                        ? "Owner"
                        : t.Professors.Any(p => p.UserId == userId)
                            ? "Professor"
                            : "Student",
                    OwnerName =
                        t.OwnerUser.Name + " " +
                        t.OwnerUser.Surname,
                    IsActive = t.IsActive,
                    Address = t.Address,
                    Alias = t.Alias,
                    CBU = t.CBU,
                    MonthlyFeeStatus = t.MonthlyFeeStatus,
                    PaymentDueDate = t.PaymentDueDate,
                    MercadoPagoConnected =
                        !string.IsNullOrWhiteSpace(
                            t.MercadoPagoAccessToken
                        ),
                    PlanPrice = t.TenantPlan.Price
                })
                .ToListAsync();

        return tenants;
    }
    public async Task<int> CountAsync(Expression<Func<Tenant, bool>> predicate)
    {
        return await _db.Tenants.CountAsync(predicate);
    }
    public async Task<Tenant?> GetByMercadoPagoUserIdAsync(
    string mercadoPagoUserId)
    {
        return await _db.Tenants
            .FirstOrDefaultAsync(
                t => t.MercadoPagoUserId == mercadoPagoUserId
            );
    }
    public async Task<List<Tenant>> GetMyOwnedTenants(int userId)
    {
        return await _db.Tenants
            .Where(t => t.OwnerUserId == userId)
            .Include(t => t.TenantPlan)
            .ToListAsync();
    }
}