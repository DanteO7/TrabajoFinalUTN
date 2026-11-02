using backend_proyecto.Config;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace backend_proyecto.Middlewares
{
    public class UserActiveMiddleware
    {
        private const string SuspendedMessage =
            "Tu cuenta está suspendida. Contactá al soporte para obtener más información.";

        private readonly RequestDelegate _next;

        public UserActiveMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ApplicationDbContext db)
        {
            var endpoint = context.GetEndpoint();
            if (endpoint?.Metadata.GetMetadata<IAllowAnonymous>() is not null ||
                endpoint?.Metadata.GetMetadata<IAuthorizeData>() is null ||
                context.User.Identity?.IsAuthenticated != true)
            {
                await _next(context);
                return;
            }

            if (!int.TryParse(context.User.FindFirst("id")?.Value, out var userId))
            {
                throw new HttpResponseError(
                    HttpStatusCode.Unauthorized,
                    "Usuario no autenticado"
                );
            }

            var isActive = await db.Users
                .AsNoTracking()
                .Where(user => user.Id == userId)
                .Select(user => (bool?)user.IsActive)
                .SingleOrDefaultAsync(context.RequestAborted);

            if (isActive is null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Unauthorized,
                    "Usuario no autenticado"
                );
            }

            if (!isActive.Value)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    SuspendedMessage
                );
            }

            await _next(context);
        }
    }
}
