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
    [Route("api/reservations")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private readonly ReservationServices _reservationServices;
        public ReservationController(ReservationServices reservationServices)
        {
            _reservationServices = reservationServices;
        }

        [HttpGet("{tenantId}/{date}")]
        [Authorize(Roles = $"{Roles.ADMIN}, {Roles.PROFESSOR}")]
        [ProducesResponseType(typeof(List<Reservation>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<Class>>> GetByDate(int tenantId, DateTime date)
        {
            try
            {
                var reservations = await _reservationServices.GetAllByDate(tenantId, date);
                return Ok(reservations);
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

        [HttpGet("{studentId}")]
        [Authorize(Roles = $"{Roles.STUDENT}, {Roles.ADMIN}, {Roles.PROFESSOR}")]
        [ProducesResponseType(typeof(List<Reservation>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<Class>>> GetByStuentId(int studentId)
        {
            try
            {
                var reservations = await _reservationServices.GetAllByStudent(studentId);
                return Ok(reservations);
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
        [Authorize(Roles = $"{Roles.STUDENT}, {Roles.ADMIN}, {Roles.PROFESSOR}")]
        [ProducesResponseType(typeof(Reservation), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<Class>> CreateOne([FromBody] CreateReservationDTO createReservationDTO)
        {
            try
            {
                var reservation = await _reservationServices.CreateOne(createReservationDTO);
                return Created("Reservation created", reservation);
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
        [Authorize(Roles = $"{Roles.ADMIN}, {Roles.PROFESSOR}")]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteOne(int id)
        {
            try
            {
                await _reservationServices.DeleteOne(id);
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

        [HttpPatch("{id}")]
        [Authorize(Roles = $"{Roles.ADMIN}, {Roles.PROFESSOR}")]
        [ProducesResponseType(typeof(Reservation), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> ChangeStatus(int id, [FromBody] ChangeStatusReservationDTO changeStatusReservationDTO)
        {
            try
            {
                var reservation = await _reservationServices.ChangeStatus(id, changeStatusReservationDTO);
                return Ok(reservation);
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
