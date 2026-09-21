using backend_proyecto.Enums;
using backend_proyecto.Repositories;
using backend_proyecto.Utils;
using Microsoft.EntityFrameworkCore;

public class BillingCycleService : BackgroundService
{
    private const int GraceDays = 9;

    private readonly IServiceScopeFactory _scopeFactory;

    public BillingCycleService(
        IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope =
                    _scopeFactory.CreateScope();

                var studentRepository =
                    scope.ServiceProvider
                        .GetRequiredService<IStudentRepository>();

                var tenantRepository =
                    scope.ServiceProvider
                        .GetRequiredService<ITenantRepository>();

                var argentinaNow =
                    TimeHelper.Now();

                var utcNow =
                    TimeHelper.UtcNow();

                await ProcessStudents(
                    studentRepository,
                    argentinaNow,
                    utcNow,
                    stoppingToken
                );

                await ProcessTenants(
                    tenantRepository,
                    argentinaNow,
                    utcNow,
                    stoppingToken
                );
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Error en BillingCycleService: {ex.Message}"
                );
            }

            await Task.Delay(
                TimeSpan.FromHours(1),
                stoppingToken
            );
        }
    }

    private async Task ProcessStudents(
        IStudentRepository studentRepository,
        DateTime argentinaNow,
        DateTime utcNow,
        CancellationToken cancellationToken)
    {
        var students =
            await studentRepository.Query()
                .Where(s =>
                    s.PaymentDueDate != null &&
                    (
                        s.MonthlyFeeStatus ==
                            MonthlyFeeStatus.PAID ||
                        s.MonthlyFeeStatus ==
                            MonthlyFeeStatus.PENDING
                    )
                )
                .ToListAsync(cancellationToken);

        foreach (var student in students)
        {
            var result =
                CalculateBillingState(
                    student.MonthlyFeeStatus,
                    student.PaymentDueDate,
                    argentinaNow
                );

            if (!result.HasChanges)
            {
                continue;
            }

            student.MonthlyFeeStatus =
                result.Status;

            student.MonthlyFeeStatusUpdatedAt =
                utcNow;

            student.PaymentDueDate =
                result.PaymentDueDate;

            await studentRepository.UpdateOneAsync(
                student
            );
        }
    }

    private async Task ProcessTenants(
    ITenantRepository tenantRepository,
    DateTime argentinaNow,
    DateTime utcNow,
    CancellationToken cancellationToken)
    {
        var tenants =
            await tenantRepository.Query()
                .Where(t =>
                    t.PaymentDueDate != null &&
                    (
                        t.MonthlyFeeStatus ==
                            MonthlyFeeStatus.PAID ||
                        t.MonthlyFeeStatus ==
                            MonthlyFeeStatus.PENDING ||
                        t.MonthlyFeeStatus ==
                            MonthlyFeeStatus.OVERDUE
                    )
                )
                .ToListAsync(cancellationToken);

        foreach (var tenant in tenants)
        {
            // Si ya está vencido, tiene que estar desactivado.
            if (tenant.MonthlyFeeStatus == MonthlyFeeStatus.OVERDUE)
            {
                if (tenant.IsActive)
                {
                    tenant.IsActive = false;

                    await tenantRepository.UpdateOneAsync(
                        tenant
                    );
                }

                continue;
            }

            var result =
                CalculateBillingState(
                    tenant.MonthlyFeeStatus,
                    tenant.PaymentDueDate,
                    argentinaNow
                );

            if (!result.HasChanges)
            {
                continue;
            }

            tenant.MonthlyFeeStatus =
                result.Status;

            tenant.MonthlyFeeStatusUpdatedAt =
                utcNow;

            tenant.PaymentDueDate =
                result.PaymentDueDate;

            if (result.Status == MonthlyFeeStatus.OVERDUE)
            {
                tenant.IsActive = false;
            }

            await tenantRepository.UpdateOneAsync(
                tenant
            );
        }
    }

    private static BillingStateResult CalculateBillingState(
        string currentStatus,
        DateTime? paymentDueDate,
        DateTime argentinaNow)
    {
        if (paymentDueDate == null)
        {
            return new BillingStateResult(
                currentStatus,
                null,
                false
            );
        }

        var today =
            argentinaNow.Date;

        var cycleEnd =
            paymentDueDate.Value.Date;

        // Todavía estamos dentro del ciclo actual.
        if (today <= cycleEnd)
        {
            return new BillingStateResult(
                currentStatus,
                paymentDueDate,
                false
            );
        }

        var daysSinceCycleEnd =
            (today - cycleEnd).Days;

        // =====================================================
        // YA TERMINÓ LA GRACIA
        // =====================================================

        if (daysSinceCycleEnd > GraceDays)
        {
            if (
                currentStatus == MonthlyFeeStatus.PAID ||
                currentStatus == MonthlyFeeStatus.PENDING
            )
            {
                return new BillingStateResult(
                    MonthlyFeeStatus.OVERDUE,
                    paymentDueDate,
                    true
                );
            }

            return new BillingStateResult(
                currentStatus,
                paymentDueDate,
                false
            );
        }

        // =====================================================
        // ESTAMOS DENTRO DE LOS 9 DÍAS DE GRACIA
        // =====================================================

        var nextCycleEnd =
            cycleEnd.AddDays(30);

        // Si estaba PAID, comenzó un nuevo ciclo
        // y ahora pasa a PENDING.
        if (
            currentStatus ==
            MonthlyFeeStatus.PAID
        )
        {
            return new BillingStateResult(
                MonthlyFeeStatus.PENDING,
                nextCycleEnd,
                true
            );
        }

        // Si ya estaba PENDING, solamente avanzamos
        // el PaymentDueDate al final del nuevo ciclo.
        if (
            currentStatus ==
            MonthlyFeeStatus.PENDING
        )
        {
            return new BillingStateResult(
                MonthlyFeeStatus.PENDING,
                nextCycleEnd,
                true
            );
        }

        return new BillingStateResult(
            currentStatus,
            paymentDueDate,
            false
        );
    }

    private sealed record BillingStateResult(
        string Status,
        DateTime? PaymentDueDate,
        bool HasChanges
    );
}