using AutoMapper;
using backend_proyecto.Config;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using Google.Apis.Auth;
using Humanizer.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;

namespace backend_proyecto.Services
{
    public class AuthServices
    {
        private readonly IUserServices _userServices;
        private readonly IEncoderServices _encoderServices;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;
        private readonly IProfessorRepository _professorRepo;
        private readonly IStudentRepository _studentRepo;
        internal readonly string _secret;
        private readonly IAdminRepository _adminRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _configuration;

        public AuthServices(
            IUserServices userServices, 
            IEncoderServices encoderServices, 
            IMapper mapper, IConfiguration config, 
            IProfessorRepository professorRepo, 
            IStudentRepository studentRepo, 
            IAdminRepository adminRepository, 
            ITenantRepository tenantRepository, 
            ApplicationDbContext db,
            IConfiguration configuration)
        {
            _userServices = userServices;
            _encoderServices = encoderServices;
            _mapper = mapper;
            _config = config;
            _professorRepo = professorRepo;
            _studentRepo = studentRepo;
            _secret = _config.GetSection("Secrets:JWT")?.Value?.ToString() ?? string.Empty;
            _adminRepository = adminRepository;
            _tenantRepository = tenantRepository;
            _db = db;
            _configuration = configuration;
        }

        public async Task<AuthResponseDTO> Register(RegisterDTO register, HttpContext context)
        {
            var existingUser = await _userServices.GetOneByEmail(register.Email);

            if (existingUser != null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    $"El usuario con este mail '{register.Email}' ya existe.");
            }
            var verification = await _db.EmailVerifications
                .Where(v => v.Email == register.Email)
                .OrderByDescending(v => v.CreatedAt)
                .FirstOrDefaultAsync();

            if (verification == null)
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    $"No existe una verificación para el mail = '{register.Email}'");

            if (verification.Used)
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    $"El código ya fue utilizado");

            if (verification.ExpiresAt < DateTime.UtcNow)
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    $"El código expiró");

            if (verification.Code != register.VerificationCode)
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    $"Código incorrecto");

            var createdUser = await _userServices.CreateOne(register);
            var userDto = _mapper.Map<UserWithoutPassDTO>(createdUser);

            _db.EmailVerifications.Remove(verification);
            await _db.SaveChangesAsync();

            var token = await GenerateJwt(userDto);
            SetCookie(token, context);

            return await BuildAuthResponse(createdUser);
        }

        public async Task<AuthResponseDTO> Login(LoginDTO login, HttpContext context)
        {
            var user = await _userServices.GetOneByEmail(login.Email);
            if (user == null)
                throw new HttpResponseError(HttpStatusCode.BadRequest, "Credenciales invalidas.");

            if (user.IsGoogleAccount)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Esta cuenta utiliza Google para iniciar sesión."
                );
            }

            if (!_encoderServices.Verify(login.Password, user.Password))
                throw new HttpResponseError(HttpStatusCode.BadRequest, "Credenciales invalidas.");

            var userDto = _mapper.Map<UserWithoutPassDTO>(user);
            var token = await GenerateJwt(userDto);
            SetCookie(token, context);

            return await BuildAuthResponse(user);
        }
        private async Task<AuthResponseDTO> BuildAuthResponse(User user)
        {
            var roles = new List<string>();
            if (await _professorRepo.ExistsByUserId(user.Id))
                roles.Add(Roles.PROFESSOR);
            if (await _studentRepo.ExistsByUserId(user.Id))
                roles.Add(Roles.STUDENT);
            if (await _adminRepository.ExistsByUserId(user.Id))
                roles.Add(Roles.ADMIN);
            if (await _tenantRepository.ExistsByUserId(user.Id))
                roles.Add(Roles.TENANT);

            return new AuthResponseDTO
            {
                Id = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Age = user.Age,
                Weight = user.Weight,
                Roles = roles
            };
        }
        public Task Logout(HttpContext context)
        {
            context.Response.Cookies.Delete("auth_token");
            return Task.CompletedTask;
        }

        public void SetCookie(string token, HttpContext context)
        {
            context.Response.Cookies.Append("auth_token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(1)
            });
        }

        public async Task<string> GenerateJwt(UserWithoutPassDTO user)
        {
            var key = Encoding.UTF8.GetBytes(_secret);

            var credentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            );

            var claims = new ClaimsIdentity();

            claims.AddClaim(
                new Claim("id", user.Id.ToString())
            );

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = claims,
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            return tokenHandler.WriteToken(
                tokenHandler.CreateToken(tokenDescriptor)
            );
        }

        public async Task<AuthResponseDTO> RegisterWithGoogle(
    GoogleRegisterDTO dto,
    HttpContext context)
        {
            GoogleJsonWebSignature.Payload payload;

            // 1. Validar la credencial de Google
            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(
                    dto.Credential,
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[]
                        {
                    _configuration["Google:ClientId"]!
                        }
                    }
                );
            }
            catch (InvalidJwtException)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Unauthorized,
                    "La credencial de Google no es válida."
                );
            }

            if (payload.EmailVerified != true)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Tu cuenta de Google debe tener el email verificado."
                );
            }

            if (string.IsNullOrWhiteSpace(payload.Subject) ||
                string.IsNullOrWhiteSpace(payload.Email))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No se pudo identificar tu cuenta de Google."
                );
            }

            // 2. Buscar una cuenta vinculada a este Google ID
            var existingGoogleUser = await _userServices.GetOneByGoogleId(
                payload.Subject
            );

            if (existingGoogleUser != null)
            {
                // Ya tiene cuenta de Google: iniciar sesión
                var userDto = _mapper.Map<UserWithoutPassDTO>(
                    existingGoogleUser
                );

                var token = await GenerateJwt(userDto);
                SetCookie(token, context);

                return await BuildAuthResponse(existingGoogleUser);
            }

            // 3. Buscar si el email pertenece a otra cuenta
            var existingUser = await _userServices.GetOneByEmail(
                payload.Email
            );

            if (existingUser != null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Conflict,
                    "Ya existe una cuenta con ese email. Iniciá sesión con tu método habitual."
                );
            }

            // 4. No existe una cuenta: crearla
            var createdUser = await _userServices.CreateGoogleUser(payload);

            // 5. Iniciar sesión automáticamente después del registro
            var createdUserDto = _mapper.Map<UserWithoutPassDTO>(
                createdUser
            );

            var createdToken = await GenerateJwt(createdUserDto);
            SetCookie(createdToken, context);

            return await BuildAuthResponse(createdUser);
        }
    }
}
