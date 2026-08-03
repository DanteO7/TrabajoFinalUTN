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
    [Route("api/specialities")]
    [ApiController]
    public class SpecialityController : ControllerBase
    {
        private readonly SpecialityServices _specialityServices;
        public SpecialityController(SpecialityServices specialityServices)
        {
            _specialityServices = specialityServices;
        }

        [HttpGet("{tenantId}")]
        [Authorize(Roles = $"{Roles.PROFESSOR}, {Roles.ADMIN}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(ResponseSpecialityDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseSpecialityDTO>>> GetAllByTenantId(int tenantId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value!);
                var specialities = await _specialityServices.GetAllByTenantId(tenantId, userId);
                return Ok(specialities);
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
        [Authorize(Roles = $"{Roles.PROFESSOR}, {Roles.ADMIN}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(ResponseSpecialityDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseSpecialityDTO>> CreateOne([FromBody] CreateSpecialityDTO createSpecialityDTO)
        {
            try
            {
                var speciality = await _specialityServices.CreateOne(createSpecialityDTO);
                return Created("Speciality created", speciality);
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
                await _specialityServices.DeleteOne(id);
                return Ok("Speciality Successfully Deleted");
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
        [Authorize(Roles = $"{Roles.PROFESSOR}, {Roles.ADMIN}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(ResponseSpecialityDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseSpecialityDTO>> UpdateOne(int id,[FromBody] UpdateSpecialityDTO updateSpecialityDTO)
        {
            try
            {
                var speciality = await _specialityServices.UpdateOne(id, updateSpecialityDTO);
                return Ok(speciality);
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
