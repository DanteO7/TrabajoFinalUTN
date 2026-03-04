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
    [Route("api/payments")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentServices _paymentServices;
        public PaymentController(PaymentServices paymentServices)
        {
            _paymentServices = paymentServices;
        }

        [HttpGet("{userId}")]
        [Authorize(Roles = $"{Roles.STUDENT}, {Roles.PROFESSOR}, {Roles.ADMIN}")]
        [ProducesResponseType(typeof(List<Payment>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<Payment>>> GetAllByUserId(int userId)
        {
            try
            {
                var payments = await _paymentServices.GetAllByIdUser(userId);
                return Ok(payments);
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
        [Authorize(Roles = $"{Roles.ADMIN}, {Roles.PROFESSOR}")]
        [ProducesResponseType(typeof(Payment), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<Payment>> CreateOne([FromBody] CreatePaymentDTO createPaymentDTO)
        {
            try
            {
                var payment = await _paymentServices.CreateOne(createPaymentDTO);
                return Created("Payment Created", payment);
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
        public async Task<ActionResult<Payment>> DeleteOne(int id)
        {
            try
            {
                await _paymentServices.DeleteOne(id);
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
        [Authorize(Roles = $"{Roles.ADMIN}")]
        [ProducesResponseType(typeof(Payment), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<Payment>> UpdateOne(int id, [FromBody] UpdatePaymentDTO updatePaymentDTO)
        {
            try
            {
                var payment = await _paymentServices.UpdateOne(id, updatePaymentDTO);
                return Ok(payment);
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
