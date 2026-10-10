using System.Net;
using System.Text.Json;
using backend_proyecto.Utils.Errors;

namespace backend_proyecto.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (HttpResponseError ex)
            {
                context.Response.Clear();
                context.Response.StatusCode = (int)ex.StatusCode;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsync(
                    JsonSerializer.Serialize(new
                    {
                        message = ex.Message
                    })
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado en la API");

                if (context.Response.HasStarted)
                    throw;

                context.Response.Clear();
                context.Response.StatusCode =
                    (int)HttpStatusCode.InternalServerError;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsync(
                    JsonSerializer.Serialize(new
                    {
                        message = "Ocurrió un error interno. Intentá nuevamente."
                    })
                );
            }
        }
    }
}