using AutoMapper;
using backend_projeto.Models.DTOs;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend_proyecto.Controllers
{
    [Route("api/tenants")]
    [ApiController]
    public class TenantController : ControllerBase
    {
        private readonly TenantServices _tenantServices;
        private readonly PermissionServices _permissionServices;
        private readonly IUserServices _userServices;
        private readonly AuthServices _authServices;
        private readonly IMapper _mapper;

        public TenantController(TenantServices tenantServices, IUserServices userServices, AuthServices authServices, IMapper mapper, PermissionServices permissionServices)
        {
            _tenantServices = tenantServices;
            _userServices = userServices;
            _authServices = authServices;
            _mapper = mapper;
            _permissionServices = permissionServices;
        }

        [HttpGet]
        [Authorize]
        [ProducesResponseType(typeof(List<ResponseTenantDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseTenantDTO>>> GetAll()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value!);
                var tenants = await _tenantServices.GetAll(userId);
                return Ok(tenants);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(UserWithoutPassDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserWithoutPassDTO>> GetOneById(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")!.Value);
                var tenant = await _tenantServices.GetById(id, userId);
                return Ok(tenant);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet("user/{targetUserId}")]
        [Authorize]
        [ProducesResponseType(typeof(List<ResponseMyTenantDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseMyTenantDTO>>> GetAllByOwnerId(int targetUserId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")!.Value);
                var tenants = await _tenantServices.GetAllByUserId(targetUserId, userId);
                return Ok(tenants);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [ProducesResponseType(typeof(ResponseTenantDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseTenantDTO>> CreateOne([FromBody] CreateTenantDTO createTenantDTO)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")!.Value);
                var tenant = await _tenantServices.CreateOne(createTenantDTO, userId);

                var user = await _userServices.GetOneById(createTenantDTO.OwnerUserId);
                var userDto = _mapper.Map<UserWithoutPassDTO>(user);

                var token = await _authServices.GenerateJwt(userDto);
                _authServices.SetCookie(token, HttpContext);

                return Created("Created", tenant);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.ToString());
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteOneById(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value!);
                await _tenantServices.DeleteOne(id, userId);
                return Ok("Tenant Successfully Deleted");
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseTenantDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseTenantDTO>> UpdateOneById(int id, [FromBody] UpdateTenantDTO dto)
        {
            try
            {
                var tenant = await _tenantServices.UpdateOne(id, dto);
                return Ok(tenant);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet("my-tenants")]
        [Authorize]
        [ProducesResponseType(typeof(List<ResponseMyTenantDTO>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<ResponseMyTenantDTO>>> GetMyTenants(
            [FromQuery] bool onlyOwned = false)
        {
            var userId = int.Parse(
                User.FindFirst("id")!.Value
            );

            var tenants =
                await _tenantServices.GetMyTenants(
                    userId,
                    onlyOwned: onlyOwned
                );

            return Ok(tenants);
        }

        [HttpGet("{tenantId}/my-permissions")]
        [Authorize]
        public async Task<IActionResult> GetMyPermissionsInTenant(
            int tenantId)
        {
            var userId = int.Parse(
                User.FindFirst("id")?.Value!
            );

            var result =
                await _permissionServices.GetUserPermissionsInTenant(
                    userId,
                    tenantId
                );

            return Ok(result);
        }

        [HttpGet("pending-payment")]
        public async Task<ActionResult<List<ResponseTenantDTO>>> GetPendingPaymentTenants()
        {
            var userId = int.Parse(User.FindFirst("id")?.Value!);

            var tenants = await _tenantServices.GetPendingPaymentTenants(userId);

            return Ok(tenants);
        }

        [HttpPost("request")]
        [Authorize]
        public async Task<IActionResult> RequestTenant(
            [FromForm] RequestTenantDTO dto)
        {
            try
            {
                var userId = int.Parse(
                    User.FindFirst("id")!.Value
                );

                await _tenantServices.RequestTenant(
                    userId,
                    dto
                );

                return Ok(new
                {
                    message = "Solicitud enviada correctamente."
                });
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    ex.Message
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    ex.Message
                );
            }
        }

        [HttpGet("create-from-token")]
        [Authorize]
        public async Task<IActionResult> GetTenantDataFromToken(
            [FromQuery] string token)
        {
            try
            {
                var userId = int.Parse(
                    User.FindFirst("id")!.Value
                );

                var data =
                    await _tenantServices.GetTenantDataFromToken(
                        userId,
                        token
                    );

                return Ok(data);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    ex.Message
                );
            }
        }

        [HttpPost("create-from-token")]
        [Authorize]
        public async Task<IActionResult> CreateTenantFromToken(
            [FromBody] CreateTenantFromTokenDTO dto)
        {
            try
            {
                var userId = int.Parse(
                    User.FindFirst("id")!.Value
                );

                var result =
                    await _tenantServices.CreateTenantFromToken(
                        userId,
                        dto
                    );

                return Ok(result);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    ex.Message
                );
            }
        }

        [HttpPost("{tenantId}/send-email-creation")]
        [Authorize]
        public async Task<IActionResult> SendTenantCreatedEmail(int tenantId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")!.Value);

                await _tenantServices.SendTenantCreatedEmailToOwner(
                    userId,
                    tenantId
                );

                return Ok(new { message = "Correo enviado correctamente." });
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
        }
    }
}
