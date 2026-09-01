using backend_proyecto.Repositories;
using backend_proyecto.Utils;

public class MonthlyOverdueService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public MonthlyOverdueService(IServiceScopeFactory scopeFactory)
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

                if (argentinaNow.Day >= 9)
                {
                    using var scope = _scopeFactory.CreateScope();

                    var studentRepository =
                        scope.ServiceProvider
                            .GetRequiredService<IStudentRepository>();

                    var tenantRepository =
                        scope.ServiceProvider
                            .GetRequiredService<ITenantRepository>();

                    var utcNow = TimeHelper.UtcNow();

                    await studentRepository.SetPendingToOverdueAsync(
                        utcNow,
                        stoppingToken
                    );

                    await tenantRepository.SetPendingToOverdueAsync(
                        utcNow,
                        stoppingToken
                    );
                }
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Error en MonthlyOverdueService: {ex.Message}"
                );
            }

            await Task.Delay(
                TimeSpan.FromHours(1),
                stoppingToken
            );
        }
    }
}