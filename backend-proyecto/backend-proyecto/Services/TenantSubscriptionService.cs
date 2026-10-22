using backend_proyecto.Config;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Services
{
    public class TenantSubscriptionService
    {
        private readonly ApplicationDbContext _db;

        public TenantSubscriptionService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task RecalculateAsync(
            int tenantId,
            bool removedPaidPayment = false,
            CancellationToken cancellationToken = default)
        {
            var tenant = await _db.Tenants
                .FirstOrDefaultAsync(
                    t => t.Id == tenantId,
                    cancellationToken);

            if (tenant == null)
            {
                throw new InvalidOperationException(
                    $"No existe el negocio con Id = '{tenantId}'.");
            }

            var trackedPayments = _db.ChangeTracker
                .Entries<Payment>()
                .Where(entry =>
                    entry.Entity.TenantId == tenantId &&
                    entry.Entity.PlanType == PlanType.TENANT &&
                    entry.State != EntityState.Detached)
                .ToList();

            var trackedPaymentIds = trackedPayments
                .Where(entry => entry.Entity.Id != 0)
                .Select(entry => entry.Entity.Id)
                .ToHashSet();

            var paymentDates = await _db.Payments
                .AsNoTracking()
                .Where(p =>
                    p.TenantId == tenantId &&
                    p.PlanType == PlanType.TENANT &&
                    p.Status == PaymentStatus.PAID &&
                    !trackedPaymentIds.Contains(p.Id))
                .OrderBy(p => p.PaymentDate)
                .ThenBy(p => p.Id)
                .Select(p => p.PaymentDate)
                .ToListAsync(cancellationToken);

            paymentDates.AddRange(trackedPayments
                .Where(entry =>
                    entry.State != EntityState.Deleted &&
                    entry.Entity.Status == PaymentStatus.PAID)
                .Select(entry => entry.Entity.PaymentDate));

            paymentDates.Sort();

            var paidThrough = GetPaidThrough(paymentDates);
            var now = DateTime.UtcNow;
            var isActive = paidThrough.HasValue && paidThrough.Value > now;

            var status = isActive
                ? MonthlyFeeStatus.PAID
                : paymentDates.Count > 0 ||
                  removedPaidPayment ||
                  tenant.MonthlyFeeStatus == MonthlyFeeStatus.OVERDUE ||
                  tenant.IsActive ||
                  tenant.PaymentDueDate.HasValue
                    ? MonthlyFeeStatus.OVERDUE
                    : MonthlyFeeStatus.PENDING;

            var dueDate = isActive ? paidThrough : null;
            var hasChanges =
                tenant.IsActive != isActive ||
                tenant.MonthlyFeeStatus != status ||
                tenant.PaymentDueDate != dueDate;

            tenant.IsActive = isActive;
            tenant.MonthlyFeeStatus = status;
            tenant.PaymentDueDate = dueDate;

            if (hasChanges)
            {
                tenant.MonthlyFeeStatusUpdatedAt = now;
            }

            await _db.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> HasCurrentSubscriptionAsync(
            int tenantId,
            CancellationToken cancellationToken = default)
        {
            var tenant = await _db.Tenants
                .AsNoTracking()
                .Where(t => t.Id == tenantId)
                .Select(t => new
                {
                    t.IsActive,
                    t.MonthlyFeeStatus,
                    t.PaymentDueDate
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (tenant == null ||
                !tenant.IsActive ||
                tenant.MonthlyFeeStatus != MonthlyFeeStatus.PAID ||
                tenant.PaymentDueDate == null ||
                tenant.PaymentDueDate <= DateTime.UtcNow)
            {
                return false;
            }

            var payments = await _db.Payments
                .AsNoTracking()
                .Where(p =>
                    p.TenantId == tenantId &&
                    p.PlanType == PlanType.TENANT &&
                    p.Status == PaymentStatus.PAID)
                .OrderBy(p => p.PaymentDate)
                .ThenBy(p => p.Id)
                .Select(p => p.PaymentDate)
                .ToListAsync(cancellationToken);

            var paidThrough = GetPaidThrough(payments);
            return paidThrough.HasValue &&
                   paidThrough.Value > DateTime.UtcNow;
        }

        private static DateTime? GetPaidThrough(
            IReadOnlyList<DateTime> paymentDates)
        {
            DateTime? paidThrough = null;

            foreach (var paymentDate in paymentDates)
            {
                var periodStart =
                    paidThrough.HasValue && paymentDate < paidThrough.Value
                        ? paidThrough.Value
                        : paymentDate;

                paidThrough = periodStart.AddMonths(1);
            }

            return paidThrough;
        }
    }
}
