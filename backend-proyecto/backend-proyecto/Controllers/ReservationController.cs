using backend_proyecto.Config;
using backend_proyecto.Enums;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend_proyecto.Controllers
{
    [ApiController]
    [Route("api/reservations")]
    public class ReservationsController : ControllerBase
    {
        private readonly ReservationServices _reservationServices;

        public ReservationsController(ReservationServices reservationServices)
        {
            _reservationServices = reservationServices;
        }

        [HttpPost("bulk")]
        [Authorize(Roles = $"{Roles.TENANT}, {Roles.PROFESSOR}, {Roles.ADMIN}")]
        [ProducesResponseType(typeof(List<ResponseReservationDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseReservationDTO>>> CreateMultiple([FromBody] BulkCreateReservationDTO bulkDTO)
        {
            try
            {
                var reservations = await _reservationServices.CreateMultiple(bulkDTO);
                return Ok(reservations);
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

        [HttpGet("{id}")]
        [Authorize(Roles = $"{Roles.STUDENT}, {Roles.PROFESSOR}, {Roles.ADMIN}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(ResponseReservationDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseReservationDTO>> GetById(int id)
        {
            try
            {
                var reservation = await _reservationServices.GetById(id);
                return Ok(reservation);
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

        [HttpGet("class/{classId}")]
        [Authorize(Roles = $"{Roles.PROFESSOR}, {Roles.ADMIN}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(List<ResponseReservationDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseReservationDTO>>> GetByClassId(int classId)
        {
            try
            {
                var reservations = await _reservationServices.GetByClassId(classId);
                return Ok(reservations);
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

        [HttpGet("class/{classId}/student/{studentId}")]
        [Authorize(Roles = $"{Roles.STUDENT}, {Roles.PROFESSOR}, {Roles.ADMIN}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(ResponseReservationDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseReservationDTO>> GetByClassAndStudent(int classId, int studentId)
        {
            try
            {
                var reservation = await _reservationServices.GetByClassAndStudent(classId, studentId);
                return Ok(reservation);
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

        [HttpGet("student/{studentId}")]
        [Authorize(Roles = $"{Roles.STUDENT}, {Roles.ADMIN}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(List<ResponseReservationDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponseReservationDTO>>> GetByStudentId(int studentId)
        {
            try
            {
                var reservations = await _reservationServices.GetByStudentId(studentId);
                return Ok(reservations);
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

        [HttpDelete("{id}")]
        [Authorize(Roles = $"{Roles.STUDENT}, {Roles.ADMIN}, {Roles.TENANT}")]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteOne(int id)
        {
            try
            {
                await _reservationServices.DeleteOne(id);
                return Ok(new { message = "Reserva eliminada correctamente" });
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
    }
}