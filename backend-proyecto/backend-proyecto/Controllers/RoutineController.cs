using backend_proyecto.models.DTOs;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend_proyecto.Controllers
{
    [Route("api/routines")]
    [ApiController]
    public class RoutineController : ControllerBase
    {
        private readonly RoutineServices _routineServices;

        public RoutineController(RoutineServices routineServices)
        {
            _routineServices = routineServices;
        }

        [HttpGet("{tenantId}")]
        [Authorize]
        [ProducesResponseType(typeof(List<ResponseRoutineDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseRoutineDTO>>> GetAllByTenantId(
            int tenantId)
        {
            try
            {
                var routines = await _routineServices.GetAllByTenantId(tenantId);
                return Ok(routines);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    ex.Message
                );
            }
        }

        [HttpGet("one/{id}")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseRoutineDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseRoutineDTO>> GetOne(int id)
        {
            try
            {
                var routine = await _routineServices.GetOne(id);
                return Ok(routine);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    ex.Message
                );
            }
        }

        [HttpPost]
        [Authorize]
        [ProducesResponseType(typeof(ResponseRoutineDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseRoutineDTO>> CreateOne(
            [FromBody] CreateRoutineDTO createRoutineDTO)
        {
            try
            {
                var routine = await _routineServices.CreateOne(createRoutineDTO);
                return Created("Routine created", routine);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    ex.Message
                );
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseRoutineDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseRoutineDTO>> UpdateOne(
            int id,
            [FromBody] UpdateRoutineDTO updateRoutineDTO)
        {
            try
            {
                var routine = await _routineServices.UpdateOne(
                    id,
                    updateRoutineDTO
                );

                return Ok(routine);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    ex.Message
                );
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
                await _routineServices.DeleteOne(id);
                return Ok("Routine Successfully Deleted");
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    ex.Message
                );
            }
        }
    }
}