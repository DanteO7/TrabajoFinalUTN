using backend_proyecto.Config;
using backend_proyecto.Enums;
using backend_proyecto.Utils;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace backend_proyecto.Services
{
    public class TenantCapacityService
    {
        private readonly ApplicationDbContext _context;

        public TenantCapacityService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task EnsureStudentCapacityAsync(int tenantId)
        {
            var tenant = await _context.Tenants
                .Include(t => t.TenantPlan)
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == tenantId);

            if (tenant == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un tenant con el Id = '{tenantId}'"
                );
            }

            var todayStartUtc =
                TimeHelper.ArgentinaTodayStartUtc();

            var activeStudents = await _context.Students
                .CountAsync(s =>
                    s.TenantId == tenantId &&
                    s.MonthlyFeeStatus == MonthlyFeeStatus.PAID &&
                    s.PaymentDueDate.HasValue &&
                    s.PaymentDueDate.Value >= todayStartUtc
                );

            if (activeStudents >= tenant.TenantPlan.MaxStudents)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    $"El plan '{tenant.TenantPlan.Name}' permite hasta {tenant.TenantPlan.MaxStudents} alumnos activos. Actualmente el tenant tiene {activeStudents}."
                );
            }
        }

        public async Task EnsureStudentActivationCapacityAsync(
            int tenantId,
            int studentId)
        {
            var tenant = await _context.Tenants
                .Include(t => t.TenantPlan)
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == tenantId);

            if (tenant == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un tenant con el Id = '{tenantId}'"
                );
            }

            var todayStartUtc =
                TimeHelper.ArgentinaTodayStartUtc();

            var studentIsActive = await _context.Students
                .AnyAsync(s =>
                    s.Id == studentId &&
                    s.TenantId == tenantId &&
                    s.MonthlyFeeStatus == MonthlyFeeStatus.PAID &&
                    s.PaymentDueDate.HasValue &&
                    s.PaymentDueDate.Value >= todayStartUtc
                );

            if (studentIsActive)
            {
                return;
            }

            var activeStudents = await _context.Students
                .CountAsync(s =>
                    s.TenantId == tenantId &&
                    s.MonthlyFeeStatus == MonthlyFeeStatus.PAID &&
                    s.PaymentDueDate.HasValue &&
                    s.PaymentDueDate.Value >= todayStartUtc
                );

            if (activeStudents >= tenant.TenantPlan.MaxStudents)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No se puede activar este alumno porque el negocio alcanzó el límite de alumnos activos de su plan. Actualizá tu plan o liberá un lugar para continuar."
                );
            }
        }

        public async Task EnsureProfessorCapacityAsync(int tenantId)
        {
            var tenant = await _context.Tenants
                .Include(t => t.TenantPlan)
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == tenantId);

            if (tenant == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un tenant con el Id = '{tenantId}'"
                );
            }

            var activeProfessors = await _context.Professors
                .CountAsync(p =>
                    p.TenantId == tenantId &&
                    p.IsActive
                );

            if (activeProfessors >= tenant.TenantPlan.MaxProfessors)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    $"El plan '{tenant.TenantPlan.Name}' permite hasta {tenant.TenantPlan.MaxProfessors} profesores activos. Actualmente el tenant tiene {activeProfessors}."
                );
            }
        }

        public async Task ExecuteWithTenantLockAsync(
            int tenantId,
            Func<Task> operation)
        {
            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            await _context.Database.ExecuteSqlInterpolatedAsync(
                $"SELECT pg_advisory_xact_lock({tenantId})"
            );

            try
            {
                await operation();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
