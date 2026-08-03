using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend_proyecto.Controllers
{
    [Route("api/classes")]
    [ApiController]
    public class ClassController : ControllerBase
    {
        private readonly ClassServices _classServices;
        public ClassController(ClassServices classServices)
        {
            _classServices = classServices;
        }

        [HttpGet("{tenantId}/{date}")]
        [Authorize(Roles = $"{Roles.STUDENT}, {Roles.ADMIN}, {Roles.PROFESSOR}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(List<ResponseClassDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseClassDTO>>> GetByDate(int tenantId, DateOnly date)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value!);
                var classes = await _classServices.GetClassesByDate(tenantId, date, userId);
                return Ok(classes);
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
        [Authorize(Roles = $"{Roles.ADMIN}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(ResponseClassDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseClassDTO>> CreateOne([FromBody] CreateClassDTO createClassDTO)
        {
            try
            {
                var classCreated = await _classServices.CreateOne(createClassDTO);
                return Created("Class created", classCreated);
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

        [HttpDelete("{id}")]
        [Authorize(Roles = $"{Roles.ADMIN}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteOne(int id)
        {
            try
            {
                await _classServices.DeleteOne(id);
                return Ok("Class Successfully Deleted");
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
        [Authorize(Roles = $"{Roles.ADMIN}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(ResponseClassDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseClassDTO>> UpdateOne(int id, [FromBody] UpdateClassDTO updateClassDTO)
        {
            try
            {
                var classUpdated = await _classServices.UpdateOne(id, updateClassDTO);
                return Ok(classUpdated);
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

        [HttpGet("{classId}/students")]
        [Authorize(Roles = $"{Roles.TENANT},{Roles.PROFESSOR}")]
        [ProducesResponseType(typeof(ResponseStudentDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<List<ResponseClassStudentDTO>>> GetStudentsByClass(int classId)
        {
            try
            {
                var result = await _classServices.GetStudentsByClass(classId);
                return Ok(result);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    new { message = ex.Message });
            }
        }
    }
}
