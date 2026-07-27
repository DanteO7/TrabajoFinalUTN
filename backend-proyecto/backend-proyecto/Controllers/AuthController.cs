using AutoMapper;
using backend_proyecto.Config;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Security.Claims;

namespace backend_proyecto.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthServices _authServices;
        private readonly IUserRepository _userRepository; 
        private readonly IProfessorRepository _professorRepo;
        private readonly IStudentRepository _studentRepo;
        private readonly IAdminRepository _adminRepository; 
        private readonly ITenantRepository _tenantRepository;
        private readonly ApplicationDbContext _db;

        private readonly IMapper _mapper;


        public AuthController(AuthServices authServices, IUserRepository userRepository, IMapper mapper, IProfessorRepository professorRepository, IStudentRepository studentRepository, IAdminRepository adminRepository, ITenantRepository tenantRepository, ApplicationDbContext db)
        {
            _authServices = authServices;
            _userRepository = userRepository;
            _mapper = mapper;
            _professorRepo = professorRepository;
            _studentRepo = studentRepository;
            _adminRepository = adminRepository;
            _tenantRepository = tenantRepository;
            _db = db;
        }

        [HttpPost("register")]
        [ProducesResponseType(typeof(LoginResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]

        public async Task<ActionResult<LoginResponseDTO>> Register([FromBody] RegisterDTO registerDTO)
        {
            try
            {
                var createdUser = await _authServices.Register(registerDTO, HttpContext);
                return Ok(createdUser);
            }
            catch(HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch(Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<LoginResponseDTO>> Login([FromBody] LoginDTO loginDTO)
        {
            try
            {
                var user = await _authServices.Login(loginDTO, HttpContext);
                return Ok(user);
            }
            catch(HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch(Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError,ex.Message);
            }
        }

        [HttpPost("logout")]
        [Authorize]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(void), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> Logout()
        {
            try
            {
                await _authServices.Logout(HttpContext);
                return Ok();
            }
            catch(Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet("health")]
        [Authorize(Roles =$"{Roles.PROFESSOR}, {Roles.STUDENT}, {Roles.ADMIN}, {Roles.TENANT}")]
        public bool Health()
        {
            return true;
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult> Me()
        {
            var idClaim = User.FindFirst("id")?.Value;

            if (idClaim == null)
                return Unauthorized();

            var userId = int.Parse(idClaim);

            var user = await _userRepository.GetOneAsync(u => u.Id == userId);

            if (user == null)
                return Unauthorized();

            var roles = new List<string>();
            if (await _professorRepo.ExistsByUserId(userId))
                roles.Add(Roles.PROFESSOR);
            if (await _studentRepo.ExistsByUserId(userId))
                roles.Add(Roles.STUDENT);
            if (await _adminRepository.ExistsByUserId(userId))
                roles.Add(Roles.ADMIN);
            if (await _tenantRepository.ExistsByUserId(userId))
                roles.Add(Roles.TENANT);

            var response = new AuthResponseDTO
            {
                Id = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Roles = roles
            };

            return Ok(response);
        }

        [HttpPost("send-register-code")]
        public async Task<ActionResult> SendRegisterCode(
            [FromBody] SendRegisterCodeDTO dto,
            [FromServices] EmailServices emailServices)
        {
            var oldCodes = _db.EmailVerifications
                .Where(v => v.Email == dto.Email && !v.Used);

            _db.EmailVerifications.RemoveRange(oldCodes);
            var code = new Random().Next(100000, 999999).ToString();

            var verification = new EmailVerification
            {
                Email = dto.Email,
                Code = code,
                ExpiresAt = DateTime.UtcNow.AddMinutes(10),
                Used = false
            };

            _db.EmailVerifications.Add(verification);
            await _db.SaveChangesAsync();

            await emailServices.SendVerificationEmail(
                dto.Email,
                code
            );

            return Ok(new
            {
                message = "Código enviado correctamente"
            });
        }
        [HttpPost("forgot-password")]
        public async Task<ActionResult> ForgotPassword(
            [FromBody] ForgotPasswordDTO dto,
            [FromServices] EmailServices emailServices)
        {
            try
            {
                await emailServices.ForgotPassword(dto.Email);
            }
            catch (CooldownException ex)
            {
                return StatusCode(429, new
                {
                    message = ex.Message,
                    remainingSeconds = ex.RemainingSeconds
                });
            }

            return Ok(new
            {
                message = "Email enviado correctamente"
            });
        }
    }
}
