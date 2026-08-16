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
    [Route("api/professors")]
    [ApiController]
    public class ProfessorController : ControllerBase
    {
        private readonly ProfessorServices _professorServices;
        public ProfessorController(ProfessorServices professorServices)
        {
            _professorServices = professorServices;
        }

        [HttpPost("assign")]
        [Authorize(Roles = $"{Roles.TENANT}, {Roles.ADMIN}")]
        [ProducesResponseType(typeof(ResponseProfessorDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseProfessorDTO>> AssignOne([FromBody] AssignProfessorDTO assignProfessorDTO)
        {
            try
            {
                var professor = await _professorServices.AssignOne(assignProfessorDTO);
                return Created("Assigned", professor);
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

        [HttpGet]
        [Authorize(Roles = $"{Roles.PROFESSOR}, {Roles.ADMIN}, {Roles.TENANT}, {Roles.STUDENT}")]
        [ProducesResponseType(typeof(ResponseProfessorDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<Professor>>> GetAllByTenantId([FromQuery] int? tenantId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value!);
                var professors = await _professorServices.GetAll(tenantId, userId);
                return Ok(professors);
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
        [Authorize(Roles = $"{Roles.PROFESSOR}, {Roles.ADMIN}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(ResponseProfessorDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseProfessorDTO>>> GetOneById(int id)
        {
            try
            {
                var professor = await _professorServices.GetOneById(id);
                return Ok(professor);
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
        public async Task<ActionResult> DeleteOneById(int id)
        {
            try
            {
                await _professorServices.DeleteOne(id);
                return Ok("Professor Successfully Deleted");
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
        [ProducesResponseType(typeof(ResponseProfessorDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseProfessorDTO>> UpdateOne(int id, UpdateProfessorDTO updateProfessorDTO)
        {
            try
            {
                var professor = await _professorServices.UpdateOne(id,updateProfessorDTO);
                return Ok(professor);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError,ex.Message);
            }
        }
    }
}
