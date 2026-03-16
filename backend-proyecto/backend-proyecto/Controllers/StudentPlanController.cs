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
    [Route("api/studentsPlan")]
    [ApiController]
    public class StudentPlanController : ControllerBase
    {
        private readonly StudentPlanServices _studentPlanServices;
        public StudentPlanController(StudentPlanServices studentPlanServices)
        {
            _studentPlanServices = studentPlanServices;
        }

        [HttpGet("{tenantId}")]
        [Authorize(Roles = $"{Roles.STUDENT}, {Roles.PROFESSOR}, {Roles.ADMIN}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(List<ResponseStudentPlanDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseStudentPlanDTO>>> GetAllByTenantId(int tenantId)
        {
            try
            {
                var studentsPlan = await _studentPlanServices.GetAllByTenantId(tenantId);
                return Ok(studentsPlan);
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
        [Authorize(Roles = $"{Roles.TENANT}, {Roles.ADMIN}")]
        [ProducesResponseType(typeof(ResponseStudentPlanDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseStudentPlanDTO>> CreateOne([FromBody] CreateStudentPlanDTO createStudentPlanDTO)
        {
            try
            {
                var studentPlan = await _studentPlanServices.CreateOne(createStudentPlanDTO);
                return Created("StudentPlan created", studentPlan);
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
                await _studentPlanServices.DeleteOne(id);
                return Ok("Student Plan Successfully Deleted");
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
        [Authorize(Roles = $"{Roles.TENANT}, {Roles.ADMIN}")]
        [ProducesResponseType(typeof(ResponseStudentPlanDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseStudentPlanDTO>> UpdateOne(int id, [FromBody] UpdateStudentPlanDTO updateStudentPlanDTO)
        {
            try
            {
                var studentPlan = await _studentPlanServices.UpdateOne(id, updateStudentPlanDTO);
                return Ok(studentPlan);
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
