using backend_proyecto.Config;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace backend_proyecto.Middlewares
{
    public class TenantMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(
            HttpContext context,
            ApplicationDbContext db)
        {
            if (!context.Request.Headers.TryGetValue(
                "X-Tenant-Id",
                out var tenantHeader))
            {
                await _next(context);
                return;
            }

            if (!int.TryParse(
                tenantHeader,
                out var tenantId))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El TenantId no es válido"
                );
            }

            var userIdClaim = context.User.FindFirst("id");

            if (userIdClaim == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Unauthorized,
                    "Usuario no autenticado"
                );
            }

            if (!int.TryParse(
                userIdClaim.Value,
                out var userId))
            {
                throw new HttpResponseError(
                    HttpStatusCode.Unauthorized,
                    "Usuario no válido"
                );
            }

            var isAdmin = await db.Admin
                .AnyAsync(a => a.UserId == userId);

            if (!isAdmin)
            {
                var belongsToTenant = await db.Tenants
                    .AnyAsync(t =>
                        t.Id == tenantId &&
                        (
                            t.OwnerUserId == userId ||

                            db.Students.Any(s =>
                                s.UserId == userId &&
                                s.TenantId == tenantId
                            ) ||

                            db.Professors.Any(p =>
                                p.UserId == userId &&
                                p.TenantId == tenantId
                            )
                        )
                    );

                if (!belongsToTenant)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.Forbidden,
                        "No tenés acceso a este tenant"
                    );
                }
            }

            await _next(context);
        }
    }
}