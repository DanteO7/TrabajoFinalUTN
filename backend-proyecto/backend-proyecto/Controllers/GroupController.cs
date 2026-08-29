using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend_proyecto.Controllers
{
    [Route("api/groups")]
    [ApiController]
    public class GroupController : ControllerBase
    {
        private readonly GroupServices _groupServices;

        public GroupController(GroupServices groupServices)
        {
            _groupServices = groupServices;
        }

        [HttpGet("{tenantId}")]
        [Authorize]
        [ProducesResponseType(typeof(List<Group>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<Group>>> GetByTenant(int tenantId)
        {
            try
            {
                var groups = await _groupServices.GetGroupsByTenant(tenantId);
                return Ok(groups);
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

        //[HttpPost("{groupId}/users/{userId}")]
        //[Authorize]
        //[ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        //[ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        //[ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        //[ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        //public async Task<ActionResult> AssignUser(int groupId, int userId)
        //{
        //    try
        //    {
        //        await _groupServices.AssignUserToGroupIfNotExists(userId, groupId);
        //        return Ok("User assigned to group");
        //    }
        //    catch (HttpResponseError ex)
        //    {
        //        return StatusCode((int)ex.StatusCode, ex.Message);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
        //    }
        //}

        [HttpDelete("{groupId}/users/{userId}")]
        [Authorize]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> RemoveUser(int groupId, int userId)
        {
            try
            {
                await _groupServices.RemoveUserFromGroup(userId, groupId);
                return Ok("User removed from group");
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

        [HttpPost("{groupId}/permissions")]
        [Authorize]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> AddPermissions(int groupId, [FromBody] string[] permissions)
        {
            try
            {
                await _groupServices.AssignPermissionsToGroup(groupId, permissions);
                return Ok("Permissions added");
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

        [HttpDelete("{groupId}/permissions/{permissionName}")]
        [Authorize]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> RemovePermission(int groupId, string permissionName)
        {
            try
            {
                await _groupServices.RemovePermissionFromGroup(groupId, permissionName);
                return Ok("Permission removed");
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
    }
}