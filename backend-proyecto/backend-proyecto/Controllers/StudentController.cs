using backend_proyecto.Enums;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend_proyecto.Controllers
{
    [Route("api/students")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly StudentServices _studentServices;
        public StudentController(StudentServices studentServices)
        {
            _studentServices = studentServices;
        }

        [HttpPost("assign")]
        [Authorize(Roles =$"{Roles.TENANT}, {Roles.ADMIN}")]
        [ProducesResponseType(typeof(ResponseStudentDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseStudentDTO>> AssignOne([FromBody] AssignStudentDTO assignStudentDTO)
        {
            try
            {
                var student = await _studentServices.AssignOne(assignStudentDTO);
                return Created("Assigned", student);
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
        [Authorize(Roles = $"{Roles.PROFESSOR}, {Roles.ADMIN}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(ResponseStudentDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseStudentDTO>>> GetAllByTenantId([FromQuery]int? tenantId)
        {
            try
            {
                var students = await _studentServices.GetAll(tenantId);
                return Ok(students);
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
        [ProducesResponseType(typeof(ResponseStudentDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseStudentDTO>>> GetOneById(int id)
        {
            try
            {
                var student = await _studentServices.GetOneById(id);
                return Ok(student);
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
        [Authorize(Roles = $"{Roles.TENANT}, {Roles.ADMIN}")]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteOneById(int id)
        {
            try
            {
                await _studentServices.DeleteOne(id);
                return Ok("Student Successfully Deleted");
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

        [HttpPatch("{id}/plan")]
        [Authorize(Roles = $"{Roles.TENANT}, {Roles.ADMIN}")]
        [ProducesResponseType(typeof(ResponseStudentDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseStudentDTO>> ChangePlan(int id, [FromBody] ChangePlanStudentDTO changePlanStudentDTO)
        {
            try
            {
                var student = await _studentServices.ChangePlan(id, changePlanStudentDTO);
                return Ok(student);
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

        [HttpPatch("{id}/status")]
        [Authorize(Roles = $"{Roles.TENANT}, {Roles.ADMIN}")]
        [ProducesResponseType(typeof(ResponseStudentDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseStudentDTO>> ChangeStatus(int id, [FromBody] ChangeStatusStudentDTO changeStatusStudentDTO)
        {
            try
            {
                var student = await _studentServices.ChangeStatus(id, changeStatusStudentDTO);
                return Ok(student);
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
