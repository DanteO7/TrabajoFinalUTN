using backend_proyecto.Enums;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend_proyecto.Controllers
{
    [ApiController]
    [Route("api/invitations")]
    public class InvitationController : ControllerBase
    {
        private readonly InvitationServices _invitationServices;

        public InvitationController(InvitationServices invitationServices)
        {
            _invitationServices = invitationServices;
        }

        // POST /api/invitation
        // El tenant crea una invitación y obtiene el link
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ResponseInvitationDTO>> CreateInvitation([FromBody] CreateInvitationDTO dto)
        {
            try
            {
                var result = await _invitationServices.CreateInvitation(dto);
                return Ok(result);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, new { message = ex.Message });
            }
        }

        // POST /api/invitation/accept/{token}
        // El usuario logueado acepta la invitación
        [HttpPost("{token}/accept")]
        [Authorize]
        public async Task<ActionResult> AcceptInvitation(Guid token, [FromBody] AcceptInvitationDTO dto)
        {
            try
            {
                var idClaim = User.FindFirst("id")?.Value;
                if (idClaim == null)
                    return Unauthorized();

                var userId = int.Parse(idClaim);

                await _invitationServices.AcceptInvitation(token, userId, dto.StudentPlanId);
                return Ok(new { message = "Te uniste correctamente al negocio" });
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("{token}")]
        [Authorize]
        public async Task<ActionResult<ResponseInvitationInfoDTO>> GetInvitationInfo([FromRoute] Guid token)
        {
            try
            {
                var result = await _invitationServices.GetInvitationInfo(token);
                return Ok(result);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteInvitation(int id)
        {
            try
            {
                await _invitationServices.DeleteInvitation(id);
                return Ok(new { message = "Invitación eliminada correctamente" });
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("tenant/{tenantId}/{role}")]
        [Authorize]
        public async Task<ActionResult<ResponseInvitationDTO>> GetInvitationByTenant(int tenantId, string role)
        {
            try
            {
                var result = await _invitationServices.GetInvitationByTenant(tenantId, role);
                return Ok(result);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, new { message = ex.Message });
            }
        }
    }
}