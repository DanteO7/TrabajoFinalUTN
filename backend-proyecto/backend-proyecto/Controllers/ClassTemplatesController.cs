using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend_proyecto.Controllers
{
    [ApiController]
    [Route("api/class-templates")]
    public class ClassTemplatesController : ControllerBase
    {
        private readonly ClassTemplateServices _classTemplateServices;

        public ClassTemplatesController(
            ClassTemplateServices classTemplateServices)
        {
            _classTemplateServices = classTemplateServices;
        }

        [HttpGet]
        [Authorize]
        [ProducesResponseType(typeof(List<ResponseClassTemplateDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseClassTemplateDTO>>> GetAll()
        {
            try
            {
                var templates = await _classTemplateServices.GetAll();

                return Ok(templates);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    new { message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    new { message = ex.Message }
                );
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseClassTemplateDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseClassTemplateDTO>> GetOne(
            int id)
        {
            try
            {
                var template = await _classTemplateServices.GetOne(id);

                return Ok(template);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    new { message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    new { message = ex.Message }
                );
            }
        }

        [HttpPost]
        [Authorize]
        [ProducesResponseType(typeof(ResponseClassTemplateDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseClassTemplateDTO>> Create(
            [FromBody] CreateClassTemplateDTO dto)
        {
            try
            {
                var template = await _classTemplateServices.Create(dto);

                return Ok(template);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    new { message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    new { message = ex.Message }
                );
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseClassTemplateDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseClassTemplateDTO>> Update(
            int id,
            [FromBody] UpdateClassTemplateDTO dto)
        {
            try
            {
                var template = await _classTemplateServices.Update(
                    id,
                    dto
                );

                return Ok(template);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    new { message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    new { message = ex.Message }
                );
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                await _classTemplateServices.Delete(id);

                return Ok(new
                {
                    message = "Plantilla eliminada correctamente"
                });
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    new { message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    new { message = ex.Message }
                );
            }
        }

        [HttpPost("{classTemplateId}/students")]
        [Authorize]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> AddStudent(
            int classTemplateId,
            [FromBody] AddClassTemplateStudentDTO dto)
        {
            try
            {
                await _classTemplateServices.AddStudent(
                    classTemplateId,
                    dto
                );

                return Ok(new
                {
                    message = "Alumno agregado correctamente"
                });
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    new { message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    new { message = ex.Message }
                );
            }
        }

        [HttpDelete("{classTemplateId}/students/{studentId}")]
        [Authorize]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> RemoveStudent(
            int classTemplateId,
            int studentId)
        {
            try
            {
                await _classTemplateServices.RemoveStudent(
                    classTemplateId,
                    studentId
                );

                return Ok(new
                {
                    message = "Alumno eliminado correctamente"
                });
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    new { message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    new { message = ex.Message }
                );
            }
        }

        [HttpPost("copy-day")]
        [Authorize]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        [Authorize]
        public async Task<ActionResult<ResponseClassDTO>> CopyDay(
            [FromBody] CopyClassTemplateDayDTO dto)
        {
            try
            {
                var classEntity = await _classTemplateServices.CopyDay(dto);

                return Ok(classEntity);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    new { message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    new { message = ex.Message }
                );
            }
        }

        [HttpPost("copy-week")]
        [Authorize]
        [ProducesResponseType(typeof(List<ResponseClassDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseClassDTO>>> CopyWeek(
            [FromBody] CopyClassTemplateWeekDTO dto)
        {
            try
            {
                var classes =
                    await _classTemplateServices.CopyWeek(dto);

                return Ok(classes);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    new { message = ex.Message }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    new { message = ex.Message }
                );
            }
        }
    }
}