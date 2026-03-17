using AutoMapper;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;

namespace backend_proyecto.Services
{
    public class AuthServices
    {
        private readonly UserServices _userServices;
        private readonly IEncoderServices _encoderServices;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;
        private readonly IProfessorRepository _professorRepo;
        private readonly IStudentRepository _studentRepo;
        internal readonly string _secret;
        private readonly IAdminRepository _adminRepository;
        private readonly ITenantRepository _tenantRepository;

        public AuthServices(UserServices userServices, IEncoderServices encoderServices, IMapper mapper, IConfiguration config, IProfessorRepository professorRepo, IStudentRepository studentRepo, IAdminRepository adminRepository, ITenantRepository tenantRepository)
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
        }

        public async Task<UserWithoutPassDTO> Register(RegisterDTO register)
        {
            var user = await _userServices.GetOneByEmail(register.Email);
            if (user != null)
            {
                throw new Exception($"El usuario con este mail '{register.Email}' ya existe.");
            }
            return await _userServices.CreateOne(register);
        }

        public async Task<LoginResponseDTO> Login(LoginDTO login, HttpContext context)
        {
            var user = await _userServices.GetOneByEmail(login.Email);
            if(user == null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, "Invalid Credentials.");
            }
            var isMatched = _encoderServices.Verify(login.Password, user.Password);
            if (!isMatched)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, "Invalid Credentials.");
            }

            await SetCookie(user, context);

            string token = await GenerateJwt(_mapper.Map<UserWithoutPassDTO>(user));

            return new LoginResponseDTO
            {
                Token = token,
                User = _mapper.Map<UserWithoutPassDTO>(user)
            };
        }

        public async Task Logout(HttpContext context)
        {
            await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        }

        public async Task SetCookie(User user, HttpContext context)
        {
            var claims = new List<Claim>
            {
                new Claim("id", user.Id.ToString())
            };

            if (await _professorRepo.ExistsByUserId(user.Id))
            {
                claims.Add(new Claim(ClaimTypes.Role, Roles.PROFESSOR));
            }

            if (await _studentRepo.ExistsByUserId(user.Id))
            {
                claims.Add(new Claim(ClaimTypes.Role, Roles.STUDENT));
            }

            if (await _adminRepository.ExistsByUserId(user.Id))
            {
                claims.Add(new Claim(ClaimTypes.Role, Roles.ADMIN));
            }

            if (await _tenantRepository.ExistsByUserId(user.Id))
            {
                claims.Add(new Claim(ClaimTypes.Role, Roles.TENANT));
            }

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await context.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTime.UtcNow.AddDays(1),
                }
            );
        }

        public async Task<string> GenerateJwt(UserWithoutPassDTO user)
        {
            var key = Encoding.UTF8.GetBytes(_secret);
            var symmetricKey = new SymmetricSecurityKey(key);

            var credentials = new SigningCredentials(
                symmetricKey,
                SecurityAlgorithms.HmacSha256Signature
            );

            var claims = new ClaimsIdentity();

            claims.AddClaim(new Claim("id", user.Id.ToString()));

            if (await _professorRepo.ExistsByUserId(user.Id))
            {
                claims.AddClaim(new Claim(ClaimTypes.Role, Roles.PROFESSOR));
            }

            if (await _studentRepo.ExistsByUserId(user.Id))
            {
                claims.AddClaim(new Claim(ClaimTypes.Role, Roles.STUDENT));
            }

            var tokenDescriptor = new SecurityTokenDescriptor()
            {
                Subject = claims,
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenConfig = tokenHandler.CreateToken(tokenDescriptor);
            string token = tokenHandler.WriteToken(tokenConfig);
            return token;
        }
    }
}
