using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend_proyecto.Controllers
{
    [Route("api/exercises")]
    [ApiController]
    public class ExerciseController : ControllerBase
    {
        private readonly ExerciseServices _exerciseServices;

        public ExerciseController(ExerciseServices exerciseServices)
        {
            _exerciseServices = exerciseServices;
        }

        [HttpGet("{tenantId}")]
        [Authorize]
        [ProducesResponseType(typeof(List<ResponseExerciseDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseExerciseDTO>>> GetAllByTenantId(int tenantId)
        {
            try
            {
                var exercises = await _exerciseServices.GetAllByTenantId(tenantId);
                return Ok(exercises);
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
        [ProducesResponseType(typeof(ResponseExerciseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseExerciseDTO>> GetOne(int id)
        {
            try
            {
                var exercise = await _exerciseServices.GetOne(id);
                return Ok(exercise);
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
        [ProducesResponseType(typeof(ResponseExerciseDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseExerciseDTO>> CreateOne(
            [FromBody] CreateExerciseDTO createExerciseDTO)
        {
            try
            {
                var exercise = await _exerciseServices.CreateOne(createExerciseDTO);
                return Created("Exercise created", exercise);
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
        [ProducesResponseType(typeof(ResponseExerciseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseExerciseDTO>> UpdateOne(
            int id,
            [FromBody] UpdateExerciseDTO updateExerciseDTO)
        {
            try
            {
                var exercise = await _exerciseServices.UpdateOne(
                    id,
                    updateExerciseDTO
                );

                return Ok(exercise);
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
                await _exerciseServices.DeleteOne(id);
                return Ok("Exercise Successfully Deleted");
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