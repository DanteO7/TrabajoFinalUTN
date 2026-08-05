using backend_proyecto.Utils;
using backend_proyecto.Repositories;
using Microsoft.EntityFrameworkCore;


public class ClassCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public ClassCleanupService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _scopeFactory.CreateScope();

            var classRepository = scope.ServiceProvider.GetRequiredService<IClassRepository>();

            var now = TimeHelper.Now();

            var classesToDelete = await classRepository.Query()
                .Include(c => c.Reservations)
                .Where(c =>
                    c.Reservations.Count == 0 &&
                    c.Date.ToDateTime(c.EndTime) < now)
                .ToListAsync();

            foreach (var classItem in classesToDelete)
            {
                await classRepository.DeleteOneAsync(classItem);
            }

            // Espera 5 minutos
            await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
        }
    }
}