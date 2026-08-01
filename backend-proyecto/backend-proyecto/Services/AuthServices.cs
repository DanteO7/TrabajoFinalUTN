using AutoMapper;
using backend_proyecto.Config;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using Humanizer;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
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


        public AuthServices(IUserServices userServices, IEncoderServices encoderServices, IMapper mapper, IConfiguration config, IProfessorRepository professorRepo, IStudentRepository studentRepo, IAdminRepository adminRepository, ITenantRepository tenantRepository, ApplicationDbContext db)
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
            claims.AddClaim(new Claim("id", user.Id.ToString()));

            var isStudent = await _studentRepo.ExistsByUserId(user.Id);
            Console.WriteLine($"UserId: {user.Id}, IsStudent: {isStudent}");

            if (await _professorRepo.ExistsByUserId(user.Id))
                claims.AddClaim(new Claim(ClaimTypes.Role, Roles.PROFESSOR));
            if (await _studentRepo.ExistsByUserId(user.Id))
                claims.AddClaim(new Claim(ClaimTypes.Role, Roles.STUDENT));
            if (await _adminRepository.ExistsByUserId(user.Id))
                claims.AddClaim(new Claim(ClaimTypes.Role, Roles.ADMIN));
            if (await _tenantRepository.ExistsByUserId(user.Id))
                claims.AddClaim(new Claim(ClaimTypes.Role, Roles.TENANT));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = claims,
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }
    }
}
