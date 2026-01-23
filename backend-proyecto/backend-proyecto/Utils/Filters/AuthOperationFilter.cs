using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Auth.Utils.Filters
{
    public class AuthOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var attributes = context.ApiDescription.CustomAttributes();

            bool isAuthorize = attributes.Any(a => a is AuthorizeAttribute);
            bool isAllowAnonymous = attributes.Any(a => a is AllowAnonymousAttribute);

            if (!isAuthorize || isAllowAnonymous)
                return;

            var securityScheme = new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Token"
                }
            };

            operation.Security = new List<OpenApiSecurityRequirement>
            {
                new OpenApiSecurityRequirement
                {
                    [securityScheme] = new List<string>()
                }
            };
        }
    }
}
