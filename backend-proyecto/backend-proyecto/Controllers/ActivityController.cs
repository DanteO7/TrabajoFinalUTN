using backend_proyecto.Enums;
using ActivityModel = backend_proyecto.Models.Activity;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Net;

namespace backend_proyecto.Controllers
{
    [Route("api/activities")]
    [ApiController]
    public class ActivityController : ControllerBase
    {
        private readonly ActivityServices _activityServices;
        public ActivityController(ActivityServices activityServices)
        {
            _activityServices = activityServices;
        }

        [HttpGet("{tenantId}")]
        [Authorize(Roles = $"{Roles.PROFESSOR}, {Roles.TENANT}, {Roles.ADMIN}")]
        [ProducesResponseType(typeof(List<ActivityModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ActivityModel>>> GetAllByTenantId(int tenantId)
        {
            try
            {
                var activities = await _activityServices.GetAllByTenantId(tenantId);
                return Ok(activities);
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
        [ProducesResponseType(typeof(ActivityModel), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ActivityModel>> CreateOne([FromBody] CreateActivityDTO createActivityDTO)
        {
            try
            {
                var activity = await _activityServices.CreateOne(createActivityDTO);
                return Created("Activity created", activity);
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
                await _activityServices.DeleteOne(id);
                return Ok();
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
        [ProducesResponseType(typeof(ActivityModel), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ActivityModel>> UpdateOne(int id, [FromBody] UpdateActivityDTO updateActivityDTO)
        {
            try
            {
                var activity = await _activityServices.UpdateOne(id, updateActivityDTO);
                return Ok(activity);
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
