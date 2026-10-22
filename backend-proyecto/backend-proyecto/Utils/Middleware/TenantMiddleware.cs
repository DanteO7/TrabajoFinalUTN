using backend_proyecto.Config;
using backend_proyecto.Services;
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
            ApplicationDbContext db,
            TenantSubscriptionService tenantSubscriptionService)
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

            if (context.Request.Path.StartsWithSegments(
                "/api/tenants/onboarding",
                StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
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

                var isOwner = await db.Tenants
                    .AnyAsync(t => t.Id == tenantId && t.OwnerUserId == userId);
                if (!isOwner)
                {
                    var inactiveProfessor = await db.Professors
                        .AnyAsync(p =>
                            p.UserId == userId &&
                            p.TenantId == tenantId &&
                            !p.IsActive
                        );

                    if (inactiveProfessor)
                    {
                        throw new HttpResponseError(
                            HttpStatusCode.Forbidden,
                            "Tu acceso a este negocio está deshabilitado. Contactá al dueño del negocio."
                        );
                    }
                }

                if (!IsSubscriptionAccessRoute(context) &&
                    !await tenantSubscriptionService.HasCurrentSubscriptionAsync(
                        tenantId,
                        context.RequestAborted))
                {
                    throw new HttpResponseError(
                        HttpStatusCode.Forbidden,
                        "La suscripción del negocio no está activa."
                    );
                }
            }

            await _next(context);
        }

        private static bool IsSubscriptionAccessRoute(HttpContext context)
        {
            var segments = context.Request.Path.Value?
                .Split('/', StringSplitOptions.RemoveEmptyEntries);

            if (segments == null || segments.Length < 3)
            {
                return false;
            }

            if (segments[0] == "api" &&
                segments[1] == "tenants" &&
                (segments.Length == 3 &&
                     HttpMethods.IsGet(context.Request.Method) ||
                 segments.Length == 4 &&
                     segments[3] == "my-permissions" &&
                     HttpMethods.IsGet(context.Request.Method)))
            {
                return true;
            }

            if (segments[0] == "api" && segments[1] == "payments")
            {
                return segments.Length == 3 &&
                           segments[2] == "my-business-payments" &&
                           HttpMethods.IsGet(context.Request.Method) ||
                       segments.Length == 4 &&
                           segments[2] == "my-status" &&
                           HttpMethods.IsGet(context.Request.Method) ||
                       segments.Length == 5 &&
                           segments[2] == "mercado-pago" &&
                           segments[3] == "tenant" &&
                           HttpMethods.IsPost(context.Request.Method);
            }

            return segments[0] == "api" &&
                   segments[1] == "mercadopago" &&
                   segments.Length == 4 &&
                   (segments[2] == "status" &&
                        HttpMethods.IsGet(context.Request.Method) ||
                    segments[2] == "connect" &&
                        HttpMethods.IsGet(context.Request.Method) ||
                    segments[2] == "disconnect" &&
                        HttpMethods.IsDelete(context.Request.Method));
        }
    }
}