using backend_proyecto.Enums;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend_proyecto.Controllers
{
    [ApiController]
    [Route("api/waitlists")]
    [Authorize]
    public class WaitlistController : ControllerBase
    {
        private readonly WaitlistServices _waitlistServices;

        public WaitlistController(WaitlistServices waitlistServices)
        {
            _waitlistServices = waitlistServices;
        }

        [HttpPost]
        [Authorize]
        [ProducesResponseType(typeof(ResponseWaitlistDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseWaitlistDTO>> CreateOne(
            CreateWaitlistDTO createWaitlistDTO)
        {
            var result = await _waitlistServices.CreateOne(
                createWaitlistDTO
            );

            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> DeleteOne(int id)
        {
            await _waitlistServices.DeleteOne(id);

            return NoContent();
        }

        [HttpGet("student/{studentId}")]
        [Authorize]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> GetByStudentId(int studentId)
        {
            var waitlists = await _waitlistServices.GetByStudentId(studentId);

            return Ok(waitlists);
        }
    }
}