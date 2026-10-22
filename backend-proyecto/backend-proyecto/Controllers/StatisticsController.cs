using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend_proyecto.Controllers
{
    [Route("api/tenants/{tenantId:int}/statistics")]
    [ApiController]
    [Authorize]
    public class StatisticsController : ControllerBase
    {
        private readonly StatisticsService _statisticsService;
        private readonly CurrentTenantService _currentTenantService;

        public StatisticsController(StatisticsService statisticsService, CurrentTenantService currentTenantService)
        {
            _statisticsService = statisticsService;
            _currentTenantService = currentTenantService;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<StatisticsSummaryDTO>> GetSummary(
            int tenantId,
            [FromQuery] string period = "month")
        {
            try
            {
                EnsureCurrentTenant(tenantId);
                return Ok(await _statisticsService.GetSummary(period));
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("classes")]
        public async Task<ActionResult<StatisticsClassesDTO>> GetClasses(
            int tenantId,
            [FromQuery] string period = "month")
        {
            try
            {
                EnsureCurrentTenant(tenantId);
                return Ok(await _statisticsService.GetClasses(period));
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("students")]
        public async Task<ActionResult<StatisticsStudentsDTO>> GetStudents(int tenantId)
        {
            try
            {
                EnsureCurrentTenant(tenantId);
                return Ok(await _statisticsService.GetStudents());
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("professors")]
        public async Task<ActionResult<StatisticsProfessorsDTO>> GetProfessors(
            int tenantId,
            [FromQuery] string period = "month")
        {
            try
            {
                EnsureCurrentTenant(tenantId);
                return Ok(await _statisticsService.GetProfessors(period));
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("payments")]
        public async Task<ActionResult<StatisticsPaymentsDTO>> GetPayments(
            int tenantId,
            [FromQuery] string period = "month")
        {
            try
            {
                EnsureCurrentTenant(tenantId);
                return Ok(await _statisticsService.GetPayments(period));
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, new { message = ex.Message });
            }
        }

        private void EnsureCurrentTenant(int tenantId)
        {
            if (_currentTenantService.GetRequiredTenantId() != tenantId)
            {
                throw new HttpResponseError(HttpStatusCode.Forbidden, "No tenés acceso a este tenant.");
            }
        }
    }
}
