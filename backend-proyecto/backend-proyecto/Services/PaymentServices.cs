using AutoMapper;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using System.Net;

namespace backend_proyecto.Services
{
    public class PaymentServices
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IStudentPlanRepository _studentPlanRepository;
        private readonly ITenantPlanRepository _tenantPlanRepository;
        private readonly ITenantRepository _tenantRepository;
        public PaymentServices(IPaymentRepository paymentRepository, IUserRepository userRepository, IMapper mapper, IStudentPlanRepository studentPlanRepository, ITenantPlanRepository tenantPlanRepository, ITenantRepository tenantRepository)
        {
            _paymentRepository = paymentRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _studentPlanRepository = studentPlanRepository;
            _tenantPlanRepository = tenantPlanRepository;
            _tenantRepository = tenantRepository;
        }
        public async Task<List<Payment>> GetAllByIdUser(int userId)
        {
            var user = await _userRepository.GetOneAsync(u => u.Id == userId);
            if(user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{userId}'");
            }
            return await _paymentRepository.GetAllAsync(p =>  p.UserId == userId);
        }
        public async Task<Payment> CreateOne(CreatePaymentDTO createPaymentDTO)
        {
            var user = await _userRepository.GetOneAsync(u => u.Id == createPaymentDTO.UserId);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{createPaymentDTO.UserId}'");
            }
            switch (createPaymentDTO.PlanType)
            {
                case PlanType.STUDENT:
                    var studentPlan = await _studentPlanRepository.GetOneAsync(p => p.Id == createPaymentDTO.PlanId);
                    if (studentPlan == null)
                    {
                        throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un plan de estudiante con el Id = '{createPaymentDTO.PlanId}'");
                    }
                    break;

                case PlanType.TENANT:
                    var tenantPlan = await _tenantPlanRepository.GetOneAsync(p => p.Id == createPaymentDTO.PlanId);
                    if (tenantPlan == null)
                    {
                        throw new HttpResponseError(HttpStatusCode.NotFound,$"No se encontró un plan de tenant con el Id = '{createPaymentDTO.PlanId}'");
                    }
                    break;

                default:
                    throw new HttpResponseError(HttpStatusCode.BadRequest, "Tipo de plan inválido" );
            }
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == createPaymentDTO.TenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{createPaymentDTO.TenantId}'");
            }
            if (createPaymentDTO.Amount <= 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El monto a pagar no puede ser menor o igual a 0");
            }
            var paymentMethod = createPaymentDTO.PaymentMethod;
            if (paymentMethod != PaymentMethod.CASH && paymentMethod != PaymentMethod.DEBIT_CARD && paymentMethod != PaymentMethod.BANK_TRANSFER)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"No existe el metodo de pago con el nombre = '{paymentMethod}'");
            }

            var payment = _mapper.Map<Payment>(createPaymentDTO);
            await _paymentRepository.CreateOneAsync(payment);
            return payment;
        }

        public async Task DeleteOne(int id)
        {
            var payment = await _paymentRepository.GetOneAsync(u => u.Id == id);
            if (payment == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un pago con el Id = '{id}'");
            }
            await _paymentRepository.DeleteOneAsync(payment);
        }

        public async Task<Payment> UpdateOne(int id, UpdatePaymentDTO updatePaymentDTO)
        {
            var payment = await _paymentRepository.GetOneAsync(u => u.Id == id);
            if (payment == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un pago con el Id = '{id}'");
            }
            if (updatePaymentDTO.UserId != null)
            {
                var user = await _userRepository.GetOneAsync(u => u.Id == updatePaymentDTO.UserId);
                if (user == null)
                {
                    throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{updatePaymentDTO.UserId}'");
                }
            }

            if (updatePaymentDTO.PlanType != null && updatePaymentDTO.PlanId != null)
            {
                switch (updatePaymentDTO.PlanType)
                {
                    case PlanType.STUDENT:
                        var studentPlan = await _studentPlanRepository.GetOneAsync(p => p.Id == updatePaymentDTO.PlanId);
                        if (studentPlan == null)
                        {
                            throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un plan de estudiante con el Id = '{updatePaymentDTO.PlanId}'");
                        }
                        break;

                    case PlanType.TENANT:
                        var tenantPlan = await _tenantPlanRepository.GetOneAsync(p => p.Id == updatePaymentDTO.PlanId);
                        if (tenantPlan == null)
                        {
                            throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un plan de tenant con el Id = '{updatePaymentDTO.PlanId}'");
                        }
                        break;

                    default:
                        throw new HttpResponseError(HttpStatusCode.BadRequest, "Tipo de plan inválido");
                }
            }

            if (updatePaymentDTO.TenantId != null)
            {
                var tenant = await _tenantRepository.GetOneAsync(t => t.Id == updatePaymentDTO.TenantId);
                if (tenant == null)
                {
                    throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{updatePaymentDTO.TenantId}'");
                }
            }

            if (updatePaymentDTO.Amount != null && updatePaymentDTO.Amount <= 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El monto a pagar no puede ser menor o igual a 0");
            }

            if (updatePaymentDTO.PaymentMethod != null)
            {
                var paymentMethod = updatePaymentDTO.PaymentMethod;

                if (paymentMethod != PaymentMethod.CASH &&
                    paymentMethod != PaymentMethod.DEBIT_CARD &&
                    paymentMethod != PaymentMethod.BANK_TRANSFER)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest, $"No existe el metodo de pago con el nombre = '{paymentMethod}'");
                }
            }

            _mapper.Map(updatePaymentDTO, payment);
            await _paymentRepository.UpdateOneAsync(payment);
            return payment;
        }
    }
}
