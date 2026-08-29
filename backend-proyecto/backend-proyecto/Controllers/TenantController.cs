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
        private readonly IUserServices _userServices;
        private readonly AuthServices _authServices;
        private readonly IMapper _mapper;

        public TenantController(TenantServices tenantServices, IUserServices userServices, AuthServices authServices, IMapper mapper)
        {
            _tenantServices = tenantServices;
            _userServices = userServices;
            _authServices = authServices;
            _mapper = mapper;
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
                var tenant = await _tenantServices.CreateOne(createTenantDTO);

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
        public async Task<ActionResult<List<ResponseMyTenantDTO>>> GetMyTenants()
        {
            var userId = int.Parse(
                User.FindFirst("id")!.Value 
            );

            var tenants = await _tenantServices.GetMyTenants(userId);

            return Ok(tenants);
        }

        [HttpGet("{tenantId}/user-roles")]
        [Authorize]
        public async Task<ActionResult<UserTenantRolesDTO>> GetUserRolesInTenant(int tenantId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value!);
                var roles = await _tenantServices.GetUserRolesInTenant(userId, tenantId);
                return Ok(roles);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, new { message = ex.Message });
            }
        }
    }
}
