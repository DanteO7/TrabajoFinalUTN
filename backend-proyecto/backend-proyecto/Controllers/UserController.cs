using backend_projeto.Models.DTOs;
using backend_proyecto.Enums;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend_proyecto.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserServices _userServices;
        private readonly IAdminRepository _adminRepository;

        public UserController(
            IUserServices userServices,
            IAdminRepository adminRepository)
        {
            _userServices = userServices;
            _adminRepository = adminRepository;
        }

        [HttpGet]
        [Authorize]
        [ProducesResponseType(typeof(PagedResponse<UserWithoutPassDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PagedResponse<UserWithoutPassDTO>>> GetUsers(
            [FromQuery] string? search,
            [FromQuery] string? role,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (!await IsCurrentUserAdminAsync())
                    return Forbid();

                page = page <= 0 ? 1 : page;
                pageSize = pageSize <= 0 ? 10 : pageSize;
                pageSize = pageSize > 50 ? 50 : pageSize;

                var result = await _userServices.GetAll(search, role, page, pageSize);

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


        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(UserWithoutPassDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserWithoutPassDTO>> GetOneById(int id)
        {
            if (!TryGetCurrentUserId(out var currentUserId))
                return Unauthorized();

            if (id != currentUserId && !await IsCurrentUserAdminAsync())
                return Forbid();

            try
            {
                var user = await _userServices.GetOneById(id);
                return Ok(user);
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

        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteOneById(int id)
        {
            if (!TryGetCurrentUserId(out var currentUserId))
                return Unauthorized();

            if (!await IsCurrentUserAdminAsync())
                return Forbid();

            if (id == currentUserId)
            {
                return Conflict(new
                {
                    message = "No podés eliminar tu propia cuenta."
                });
            }

            try
            {
                await _userServices.DeleteOne(id);
                return Ok("User Successfully Deleted");
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (DbUpdateException)
            {
                return Conflict(new
                {
                    message = "No se puede eliminar el usuario porque tiene datos asociados."
                });
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(UserWithoutPassDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserWithoutPassDTO>> UpdateOneById(int id, [FromBody] UpdateUserDTO updatedUser)
        {
            if (!TryGetCurrentUserId(out var authenticatedUserId))
                return Unauthorized();

            if (authenticatedUserId != id && !await IsCurrentUserAdminAsync())
                return Forbid();

            try
            {
                var user = await _userServices.UpdateOne(id, updatedUser);
                return Ok(user);
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

        [HttpPatch("email/{id}")]
        [Authorize]
        [ProducesResponseType(typeof(UserWithoutPassDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserWithoutPassDTO>> ChangeEmail(int id, [FromBody] ChangeEmailDTO changeEmailDTO)
        {
            if (!TryGetCurrentUserId(out var currentUserId))
                return Unauthorized();

            if (id != currentUserId && !await IsCurrentUserAdminAsync())
                return Forbid();

            try
            {
                var user = await _userServices.ChangeEmail(id, changeEmailDTO);
                return Ok(user);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Inner: {ex.InnerException?.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");

                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    ex.Message
                );
            }
        }

        private bool TryGetCurrentUserId(out int userId)
        {
            return int.TryParse(User.FindFirst("id")?.Value, out userId);
        }

        private async Task<bool> IsCurrentUserAdminAsync()
        {
            return TryGetCurrentUserId(out var userId) &&
                   await _adminRepository.ExistsByUserId(userId);
        }

        [HttpPatch("password")]
        [ProducesResponseType(typeof(UserWithoutPassDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserWithoutPassDTO>> ChangePassword([FromBody] ChangePasswordDTO changePasswordDTO)
        {
            try
            {
                var user = await _userServices.ChangePassword(changePasswordDTO);
                return Ok(user);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Inner: {ex.InnerException?.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");

                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    ex.Message
                );
            }
        }
    }
}
