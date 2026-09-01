using backend_proyecto.Repositories;
using backend_proyecto.Utils;
using Microsoft.EntityFrameworkCore;

public class MonthlyPendingService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public MonthlyPendingService(IServiceScopeFactory scopeFactory)
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
                var argentinaNow = TimeHelper.Now();

                // Solamente el día 1
                if (argentinaNow.Day == 1)
                {
                    using var scope = _scopeFactory.CreateScope();

                    var studentRepository =
                        scope.ServiceProvider
                            .GetRequiredService<IStudentRepository>();

                    var tenantRepository =
                        scope.ServiceProvider
                            .GetRequiredService<ITenantRepository>();

                    var currentMonthArgentina = new DateTime(
                        argentinaNow.Year,
                        argentinaNow.Month,
                        1,
                        0,
                        0,
                        0,
                        DateTimeKind.Unspecified
                    );

                    var currentMonthUtc =
                        TimeZoneInfo.ConvertTimeToUtc(
                            currentMonthArgentina,
                            TimeZoneInfo.FindSystemTimeZoneById(
                                "America/Argentina/Buenos_Aires"
                            )
                        );

                    var studentsNeedReset =
                        await studentRepository.Query()
                            .AnyAsync(
                                s =>
                                    s.MonthlyFeeStatusUpdatedAt == null ||
                                    s.MonthlyFeeStatusUpdatedAt < currentMonthUtc,
                                stoppingToken
                            );

                    if (studentsNeedReset)
                    {
                        await studentRepository.ResetMonthlyFeeStatusAsync(
                            TimeHelper.UtcNow(),
                            stoppingToken
                        );
                    }

                    var tenantsNeedReset =
                        await tenantRepository.Query()
                            .AnyAsync(
                                t =>
                                    t.MonthlyFeeStatusUpdatedAt == null ||
                                    t.MonthlyFeeStatusUpdatedAt < currentMonthUtc,
                                stoppingToken
                            );

                    if (tenantsNeedReset)
                    {
                        await tenantRepository.ResetMonthlyFeeStatusAsync(
                            TimeHelper.UtcNow(),
                            stoppingToken
                        );
                    }
                }
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Error en MonthlyPendingService: {ex.Message}"
                );
            }

            await Task.Delay(
                TimeSpan.FromHours(1),
                stoppingToken
            );
        }
    }
}