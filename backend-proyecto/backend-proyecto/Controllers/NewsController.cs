using backend_proyecto.Enums;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend_proyecto.Controllers
{
    [Route("api/news")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly NewsServices _newsServices;
        public NewsController(NewsServices newsServices)
        {
            _newsServices = newsServices;
        }

        [HttpPost]
        [Authorize]
        [ProducesResponseType(typeof(ResponseNewsDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseNewsDTO>> CreateOne([FromBody] CreateNewsDTO dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value!);
                var novedad = await _newsServices.CreateOne(dto, userId);
                return Ok(novedad);
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
        [Authorize]
        [ProducesResponseType(typeof(ResponseNewsDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseNewsDTO>> Update(int id,[FromBody] UpdateNewsDTO dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value!);
                var novedad = await _newsServices.UpdateOne(id, dto, userId);
                return Ok(novedad);
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
        [Authorize]
        [ProducesResponseType(typeof(List<ResponseNewsDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseNewsDTO>>> GetNews([FromQuery] int? tenantId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value!);
                var novedades = await _newsServices.GetNews(tenantId, userId);
                return Ok(novedades);
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

        [HttpGet("unread-count")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseNewsDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<NewsCountDTO>> GetUnreadCount([FromQuery] int? tenantId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value!);
                var count = await _newsServices.GetUnreadCount(tenantId, userId);
                return Ok(new { unreadCount = count });
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

        [HttpPost("{id}/mark-as-read")]
        [Authorize]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> MarkAsRead(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value!);
                await _newsServices.MarkAsRead(id, userId);
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

        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteNews(int id, [FromQuery] int? tenantId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value!);
                var tenant = tenantId ?? 0;

                await _newsServices.DeleteOne(id, tenant, userId);
                return Ok(new { message = "Noticia eliminada correctamente" });
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError,
                    new { message = ex.Message });
            }
        }
    }
}
