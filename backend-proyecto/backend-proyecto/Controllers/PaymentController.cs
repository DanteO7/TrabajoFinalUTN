using backend_proyecto.Models.DTOs;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend_proyecto.Controllers
{
    [Route("api/payments")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentServices _paymentServices;

        public PaymentController(
            PaymentServices paymentServices)
        {
            _paymentServices = paymentServices;
        }

        // =========================================================
        // MIS PAGOS
        // =========================================================

        [HttpGet("my-payments")]
        [Authorize]
        [ProducesResponseType(
            typeof(List<ResponsePaymentDTO>),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status400BadRequest)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponsePaymentDTO>>> GetMyPayments(
            [FromQuery] int year,
            [FromQuery] int month)
        {
            try
            {
                var userId =
                    int.Parse(User.FindFirst("id")?.Value!);

                var payments =
                    await _paymentServices.GetAllByIdUser(
                        userId,
                        year,
                        month
                    );

                return Ok(payments);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    ex.Message
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    ex.Message
                );
            }
        }

        // =========================================================
        // PAGOS DEL NEGOCIO
        // =========================================================

        [HttpGet("tenant/{tenantId}")]
        [Authorize]
        [ProducesResponseType(
            typeof(List<ResponsePaymentDTO>),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status400BadRequest)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status403Forbidden)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status404NotFound)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponsePaymentDTO>>> GetByTenant(
            int tenantId,
            [FromQuery] int year,
            [FromQuery] int month)
        {
            try
            {
                var userId =
                    int.Parse(User.FindFirst("id")?.Value!);

                var payments =
                    await _paymentServices.GetAllByTenant(
                        tenantId,
                        userId,
                        year,
                        month
                    );

                return Ok(payments);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    ex.Message
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    ex.Message
                );
            }
        }

        // =========================================================
        // PAGOS DE TENANTS - SOLO ADMIN
        // =========================================================

        [HttpGet("admin/tenants")]
        [Authorize]
        [ProducesResponseType(
            typeof(List<ResponsePaymentDTO>),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status400BadRequest)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status403Forbidden)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ResponsePaymentDTO>>> GetTenantPaymentsForAdmin(
            [FromQuery] int year,
            [FromQuery] int month)
        {
            try
            {
                var userId =
                    int.Parse(User.FindFirst("id")?.Value!);

                var payments =
                    await _paymentServices
                        .GetTenantPaymentsForAdmin(
                            userId,
                            year,
                            month
                        );

                return Ok(payments);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    ex.Message
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    ex.Message
                );
            }
        }

        [HttpGet("my-payments/{tenantId}")]
        [Authorize]
        public async Task<IActionResult> GetMyPaymentsByTenant(
            int tenantId,
            [FromQuery] int year,
            [FromQuery] int month)
        {
            var userId = int.Parse(
                User.FindFirst("id")?.Value!
            );

            var payments =
                await _paymentServices.GetMyPaymentsByTenant(
                    userId,
                    tenantId,
                    year,
                    month
                );

            return Ok(payments);
        }

        [HttpGet("my-status/{tenantId}")]
        [Authorize]
        public async Task<IActionResult> GetMyTenantPaymentStatus(
            int tenantId)
        {
            var userId = int.Parse(
                User.FindFirst("id")?.Value!
            );

            var status =
                await _paymentServices.GetMyTenantPaymentStatus(
                    userId,
                    tenantId
                );

            return Ok(status);
        }

        // =========================================================
        // CREAR PAGO
        // =========================================================

        [HttpPost]
        [Authorize]
        [ProducesResponseType(
            typeof(ResponsePaymentDTO),
            StatusCodes.Status201Created)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status400BadRequest)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status403Forbidden)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status404NotFound)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponsePaymentDTO>> CreateOne(
            [FromBody] CreatePaymentDTO createPaymentDTO)
        {
            try
            {
                var userId =
                    int.Parse(User.FindFirst("id")?.Value!);

                var payment =
                    await _paymentServices.CreateOne(createPaymentDTO);

                return Created(
                    $"api/payments/{payment.Id}",
                    payment
                );
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    ex.Message
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    ex.Message
                );
            }
        }

        [HttpPost("mercado-pago/student/{tenantId}")]
        [Authorize]
        public async Task<IActionResult> CreateMercadoPagoStudentPayment(
        int tenantId)
        {
            var userId = int.Parse(
                User.FindFirst("id")?.Value!
            );

            var checkoutUrl =
                await _paymentServices.CreateMercadoPagoStudentPayment(
                    userId,
                    tenantId
                );

            return Ok(new
            {
                checkoutUrl
            });
        }

        // =========================================================
        // ELIMINAR
        // =========================================================

        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(
            typeof(void),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status404NotFound)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteOne(int id)
        {
            try
            {
                await _paymentServices.DeleteOne(id);

                return Ok("Payment Successfully Deleted");
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    ex.Message
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    ex.Message
                );
            }
        }

        // =========================================================
        // ACTUALIZAR
        // =========================================================

        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(
            typeof(ResponsePaymentDTO),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status400BadRequest)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status404NotFound)]
        [ProducesResponseType(
            typeof(HttpMessage),
            StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponsePaymentDTO>> UpdateOne(
            int id,
            [FromBody] UpdatePaymentDTO updatePaymentDTO)
        {
            try
            {
                var payment =
                    await _paymentServices.UpdateOne(
                        id,
                        updatePaymentDTO
                    );

                return Ok(payment);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode(
                    (int)ex.StatusCode,
                    ex.Message
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Inner: {ex.InnerException?.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");

                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    ex.Message
                );
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetOne(int id)
        {
            var userId = int.Parse(
                User.FindFirst("id")?.Value!
            );

            var payment = await _paymentServices.GetOne(
                id,
                userId
            );

            return Ok(payment);
        }

        [HttpGet("my-business-payments")]
        [Authorize]
        public async Task<IActionResult> GetMyBusinessPayments(
            int year,
            int month)
        {
            var userId = int.Parse(
                User.FindFirst("id")?.Value!
            );

            var payments =
                await _paymentServices.GetMyBusinessPayments(
                    userId,
                    year,
                    month
                );

            return Ok(payments);
        }
    }
}