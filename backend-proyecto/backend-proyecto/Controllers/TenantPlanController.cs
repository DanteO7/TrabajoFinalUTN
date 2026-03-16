using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend_proyecto.Controllers
{
    [Route("api/tenantsPlan")]
    [ApiController]
    public class TenantPlanController : ControllerBase
    {
        private readonly TenantPlanServices _tenantPlanServices;
        public TenantPlanController(TenantPlanServices tenantPlanServices)
        {
            _tenantPlanServices = tenantPlanServices;
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<ResponseTenantPlanDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseTenantPlanDTO>>> GetAll()
        {
            try
            {
                var tenantsPlan = await _tenantPlanServices.GetAll();
                return Ok(tenantsPlan);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Authorize(Roles = $"{Roles.ADMIN}")]
        [ProducesResponseType(typeof(ResponseTenantPlanDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseTenantPlanDTO>> CreateOne([FromBody] CreateTenantPlanDTO createTenantPlanDTO)
        {
            try
            {
                var tenantPlan = await _tenantPlanServices.CreateOne(createTenantPlanDTO);
                return Created("Created", tenantPlan);
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
        [Authorize(Roles = $"{Roles.ADMIN}")]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteOneById(int id)
        {
            try
            {
                await _tenantPlanServices.DeleteOne(id);
                return Ok("Tenant Plan Successfully Deleted");
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
        [Authorize(Roles = $"{Roles.ADMIN}")]
        [ProducesResponseType(typeof(ResponseTenantPlanDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseTenantPlanDTO>> UpdateOneById(int id, [FromBody] UpdateTenantPlanDTO updateTenantPlan)
        {
            try
            {
                var tenantPlan = await _tenantPlanServices.UpdateOne(id, updateTenantPlan);
                return Ok(tenantPlan);
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
