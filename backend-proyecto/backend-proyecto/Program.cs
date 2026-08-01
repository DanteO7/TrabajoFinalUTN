using Auth.Utils.Filters;
using backend_proyecto.Config;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Resend;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "Auth API",
        Description = "An ASP.NET Core Web Api for managing Auth"
    });

    options.AddSecurityDefinition("Token", new OpenApiSecurityScheme()
    {
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer Scheme.",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Name = "Authorization",
        Scheme = "bearer"
    });

    options.OperationFilter<AuthOperationFilter>();
});

// DbContext configuration
builder.Services.AddDbContext<ApplicationDbContext>(opts =>
{
    opts.UseNpgsql(
        builder.Configuration.GetConnectionString("DatabaseConnection"),
        o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)
    );
});

// Services
builder.Services.AddScoped<TenantServices>();
builder.Services.AddScoped<AuthServices>();
builder.Services.AddScoped<IEncoderServices, EncoderServices>();
builder.Services.AddScoped<IUserServices, UserServices>();
builder.Services.AddScoped<SpecialityServices>();
builder.Services.AddScoped<StudentPlanServices>();
builder.Services.AddScoped<TenantPlanServices>();
builder.Services.AddScoped<PaymentServices>();
builder.Services.AddScoped<ClassServices>();
builder.Services.AddScoped<ActivityServices>();
builder.Services.AddScoped<StudentServices>();
builder.Services.AddScoped<ProfessorServices>();
builder.Services.AddScoped<ReservationServices>();
builder.Services.AddScoped<GroupServices>();
builder.Services.AddScoped<PermissionServices>();
builder.Services.AddScoped<EmailServices>(); 
builder.Services.AddScoped<InvitationServices>();

// Repositories
builder.Services.AddScoped<ITenantRepository, TenantRepository>();
builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
builder.Services.AddScoped<IClassRepository, ClassRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IStudentPlanRepository, StudentPlanRepository>();
builder.Services.AddScoped<ITenantPlanRepository, TenantPlanRepository>();
builder.Services.AddScoped<ISpecialityRepository, SpecialityRepository>();
builder.Services.AddScoped<IProfessorRepository, ProfessorRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>(); 
builder.Services.AddScoped<IInvitationRepository, InvitationRepository>();

// AutoMapper
builder.Services.AddAutoMapper(opts => { }, typeof(Mapping));

// JWT
var secret = builder.Configuration.GetSection("Secrets:JWT")?.Value?.ToString() ?? string.Empty;
var key = Encoding.UTF8.GetBytes(secret);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.SaveToken = true;
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
        };
        opts.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Cookies["auth_token"];
                if (!string.IsNullOrEmpty(token))
                    context.Token = token;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddHttpClient<ResendClient>();

builder.Services.Configure<ResendClientOptions>(options =>
{
    options.ApiToken = builder.Configuration.GetSection("Resend:ApiKey")?.Value?.ToString() ?? string.Empty;
});

builder.Services.AddTransient<IResend, ResendClient>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    try
    {
        db.Database.Migrate();
        Console.WriteLine("Migraciones aplicadas correctamente.");
    }
    catch (Exception ex)
    {
        Console.WriteLine(ex.ToString());
        throw;
    }
}

var allowedOrigins = builder.Configuration
    .GetSection("Frontend:AllowedOrigins")
    .Get<string[]>()
    ?? [];

app.UseCors(opts =>
{
    opts.AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials()
         .WithOrigins(allowedOrigins);
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders =
        ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto
});

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
