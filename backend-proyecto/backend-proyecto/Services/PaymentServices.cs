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
        private readonly MercadoPagoServices _mercadoPagoServices;
        private readonly PermissionServices _permissionServices;
        private readonly IStudentRepository _studentRepository;
        private readonly IAdminRepository _adminRepository; 
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PaymentServices(
            IPaymentRepository paymentRepository,
            IUserRepository userRepository,
            IMapper mapper,
            IStudentPlanRepository studentPlanRepository,
            ITenantPlanRepository tenantPlanRepository,
            ITenantRepository tenantRepository,
            MercadoPagoServices mercadoPagoServices,
            PermissionServices permissionServices,
            IStudentRepository studentRepository,
            IAdminRepository adminRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _paymentRepository = paymentRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _studentPlanRepository = studentPlanRepository;
            _tenantPlanRepository = tenantPlanRepository;
            _tenantRepository = tenantRepository;
            _mercadoPagoServices = mercadoPagoServices;
            _permissionServices = permissionServices;
            _studentRepository = studentRepository;
            _adminRepository = adminRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        // =========================================================
        // RANGO DEL MES
        // =========================================================

        private static (DateTime Start, DateTime End) GetMonthRange(
            int year,
            int month)
        {
            if (year < 2000 || year > 2100)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El año no es válido."
                );
            }

            if (month < 1 || month > 12)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El mes debe estar entre 1 y 12."
                );
            }

            var start = new DateTime(
                year,
                month,
                1,
                0,
                0,
                0,
                DateTimeKind.Utc
            );

            return (
                start,
                start.AddMonths(1)
            );
        }
        private async Task<List<ResponsePaymentDTO>> MapPaymentsWithPlanName(
            List<Payment> payments)
        {
            var result = _mapper.Map<List<ResponsePaymentDTO>>(payments);

            var studentPlanIds = payments
                .Where(p => p.PlanType == PlanType.STUDENT)
                .Select(p => p.PlanId)
                .Distinct()
                .ToList();

            var tenantPlanIds = payments
                .Where(p => p.PlanType == PlanType.TENANT)
                .Select(p => p.PlanId)
                .Distinct()
                .ToList();

            var studentPlans = studentPlanIds.Count > 0
                ? await _studentPlanRepository.GetAllAsync(
                    p => studentPlanIds.Contains(p.Id)
                )
                : new List<StudentPlan>();

            var tenantPlans = tenantPlanIds.Count > 0
                ? await _tenantPlanRepository.GetAllAsync(
                    p => tenantPlanIds.Contains(p.Id)
                )
                : new List<TenantPlan>();

            var studentPlanNames = studentPlans.ToDictionary(
                p => p.Id,
                p => p.Name
            );

            var tenantPlanNames = tenantPlans.ToDictionary(
                p => p.Id,
                p => p.Name
            );

            foreach (var payment in result)
            {
                if (payment.PlanType == PlanType.STUDENT &&
                    studentPlanNames.TryGetValue(
                        payment.PlanId,
                        out var studentPlanName))
                {
                    payment.PlanName = studentPlanName;
                }
                else if (payment.PlanType == PlanType.TENANT &&
                         tenantPlanNames.TryGetValue(
                             payment.PlanId,
                             out var tenantPlanName))
                {
                    payment.PlanName = tenantPlanName;
                }
            }

            return result;
        }

        // =========================================================
        // MIS PAGOS
        // =========================================================

        public async Task<List<ResponsePaymentDTO>> GetAllByIdUser(
            int userId,
            int year,
            int month)
        {
            var user = await _userRepository.GetOneAsync(
                u => u.Id == userId
            );

            if (user == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un usuario con el Id = '{userId}'"
                );
            }

            var (startOfMonth, startOfNextMonth) =
                GetMonthRange(year, month);

            var payments = await _paymentRepository.GetAllAsync(
                p => p.UserId == userId &&
                     p.PaymentDate >= startOfMonth &&
                     p.PaymentDate < startOfNextMonth,
                p => p.User,
                p => p.Tenant
            );

            return await MapPaymentsWithPlanName(payments);
        }

        // =========================================================
        // PAGOS DEL NEGOCIO
        // =========================================================

        public async Task<List<ResponsePaymentDTO>> GetAllByTenant(
            int tenantId,
            int userId,
            int year,
            int month)
        {
            var tenant = await _tenantRepository.GetOneAsync(
                t => t.Id == tenantId
            );

            if (tenant == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el negocio."
                );
            }

            if (tenant.OwnerUserId != userId)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "No tenés permisos para consultar los pagos de este negocio."
                );
            }

            var (startOfMonth, startOfNextMonth) =
                GetMonthRange(year, month);

            var payments = await _paymentRepository.GetAllAsync(
                p => p.TenantId == tenantId &&
                        p.PlanType == PlanType.STUDENT &&
                        p.PaymentDate >= startOfMonth &&
                        p.PaymentDate < startOfNextMonth,
                p => p.User,
                p => p.Tenant
            );

            return await MapPaymentsWithPlanName(payments);
        }

        // =========================================================
        // PAGOS DE LOS TENANTS - SOLO ADMIN
        // =========================================================

        public async Task<List<ResponsePaymentDTO>> GetTenantPaymentsForAdmin(
            int userId,
            int year,
            int month)
        {
            var isAdmin =
                await _adminRepository.ExistsByUserId(userId);

            if (!isAdmin)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "Solo un administrador puede buscar los pagos de los negocios."
                );
            }

            var (startOfMonth, startOfNextMonth) =
                GetMonthRange(year, month);

            var payments = await _paymentRepository.GetAllAsync(
                p => p.PlanType == PlanType.TENANT &&
                     p.PaymentDate >= startOfMonth &&
                     p.PaymentDate < startOfNextMonth,
                p => p.User,
                p => p.Tenant
            );

            return await MapPaymentsWithPlanName(payments);
        }

        // =========================================================
        // CREAR PAGO MANUAL
        // =========================================================

        public async Task<ResponsePaymentDTO> CreateOne(
            CreatePaymentDTO createPaymentDTO)
        {
            if (createPaymentDTO.PlanType == PlanType.STUDENT)
            {
                await _permissionServices.CheckPermission(
                    Permissions.PAYMENT_CREATE
                );
            }
            else if (createPaymentDTO.PlanType == PlanType.TENANT)
            {
                var userId = _httpContextAccessor.HttpContext?
                    .User.FindFirst("id")?.Value;

                if (!int.TryParse(userId, out var currentUserId))
                {
                    throw new HttpResponseError(
                        HttpStatusCode.Unauthorized,
                        "No se pudo identificar al usuario."
                    );
                }

                var isAdmin = await _adminRepository.ExistsByUserId(currentUserId);

                if (!isAdmin)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.Forbidden,
                        "Solo un administrador puede registrar pagos de negocios."
                    );
                }
            }
            else
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Tipo de plan inválido."
                );
            }

            var tenant = await _tenantRepository.GetOneAsync(
                t => t.Id == createPaymentDTO.TenantId
            );

            if (tenant == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el negocio."
                );
            }

            var user = await _userRepository.GetOneAsync(
                u => u.Id == createPaymentDTO.UserId
            );

            if (user == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un usuario con el Id = '{createPaymentDTO.UserId}'"
                );
            }

            var now = DateTime.UtcNow;

            var startOfMonth = new DateTime(
                now.Year,
                now.Month,
                1,
                0,
                0,
                0,
                DateTimeKind.Utc
            );

            var startOfNextMonth = startOfMonth.AddMonths(1);

            var existingPayment =
                await _paymentRepository.GetOneAsync(
                    p => p.UserId == createPaymentDTO.UserId &&
                         p.TenantId == createPaymentDTO.TenantId &&
                         p.PlanType == createPaymentDTO.PlanType &&
                         p.PaymentDate >= startOfMonth &&
                         p.PaymentDate < startOfNextMonth &&
                         p.Status != PaymentStatus.CANCELLED &&
                         p.Status != PaymentStatus.REJECTED
                );

            if (existingPayment != null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    createPaymentDTO.PlanType == PlanType.STUDENT
                        ? "El alumno ya tiene un pago registrado para este mes."
                        : "El negocio ya tiene un pago registrado para este mes."
                );
            }

            decimal amount;

            Student? student = null;

            switch (createPaymentDTO.PlanType)
            {
                case PlanType.STUDENT:

                    student = await _studentRepository.GetOneAsync(
                        s => s.UserId == createPaymentDTO.UserId &&
                             s.TenantId == createPaymentDTO.TenantId
                    );

                    if (student == null)
                    {
                        throw new HttpResponseError(
                            HttpStatusCode.BadRequest,
                            "El usuario seleccionado no es alumno de este negocio."
                        );
                    }

                    if (student.StudentPlanId != createPaymentDTO.PlanId)
                    {
                        throw new HttpResponseError(
                            HttpStatusCode.BadRequest,
                            "El plan indicado no corresponde al plan actual del alumno."
                        );
                    }

                    var studentPlan =
                        await _studentPlanRepository.GetOneAsync(
                            p => p.Id == student.StudentPlanId
                        );

                    if (studentPlan == null)
                    {
                        throw new HttpResponseError(
                            HttpStatusCode.NotFound,
                            $"No se encontró el plan de estudiante con el Id = '{student.StudentPlanId}'"
                        );
                    }

                    amount = studentPlan.Price;

                    break;

                case PlanType.TENANT:

                    if (tenant.TenantPlanId != createPaymentDTO.PlanId)
                    {
                        throw new HttpResponseError(
                            HttpStatusCode.BadRequest,
                            "El plan indicado no corresponde al plan actual del negocio."
                        );
                    }

                    var tenantPlan =
                        await _tenantPlanRepository.GetOneAsync(
                            p => p.Id == createPaymentDTO.PlanId
                        );

                    if (tenantPlan == null)
                    {
                        throw new HttpResponseError(
                            HttpStatusCode.NotFound,
                            $"No se encontró un plan de negocio con el Id = '{createPaymentDTO.PlanId}'"
                        );
                    }

                    amount = tenantPlan.Price;

                    break;

                default:

                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "Tipo de plan inválido"
                    );
            }

            if (amount <= 0)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El monto del plan debe ser mayor a 0"
                );
            }

            var paymentMethod = createPaymentDTO.PaymentMethod;

            if (paymentMethod != PaymentMethod.CASH &&
                paymentMethod != PaymentMethod.DEBIT_CARD &&
                paymentMethod != PaymentMethod.BANK_TRANSFER)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    $"No existe el método de pago con el nombre = '{paymentMethod}'"
                );
            }

            var payment = new Payment
            {
                UserId = createPaymentDTO.UserId,
                PlanId = createPaymentDTO.PlanId,
                PlanType = createPaymentDTO.PlanType,
                TenantId = createPaymentDTO.TenantId,
                Amount = amount,
                PaymentMethod = paymentMethod,
                PaymentDate = DateTime.UtcNow,
                Status = PaymentStatus.PAID,
                ExternalPaymentId = null
            };

            await _paymentRepository.CreateOneAsync(payment);

            // Actualizar estado de cuota mensual
            if (createPaymentDTO.PlanType == PlanType.STUDENT)
            {
                student!.MonthlyFeeStatus = MonthlyFeeStatus.PAID;
                student.MonthlyFeeStatusUpdatedAt = DateTime.UtcNow;

                await _studentRepository.UpdateOneAsync(student);
            }
            else if (createPaymentDTO.PlanType == PlanType.TENANT)
            {
                tenant.MonthlyFeeStatus = MonthlyFeeStatus.PAID;
                tenant.MonthlyFeeStatusUpdatedAt = DateTime.UtcNow;

                await _tenantRepository.UpdateOneAsync(tenant);
            }

            return _mapper.Map<ResponsePaymentDTO>(payment);
        }

        public async Task<List<ResponsePaymentDTO>> GetMyPaymentsByTenant(
            int userId,
            int tenantId,
            int year,
            int month)
        {
            var tenant = await _tenantRepository.GetOneAsync(
                t => t.Id == tenantId
            );

            if (tenant == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el negocio."
                );
            }

            var student = await _studentRepository.GetOneAsync(
                s => s.UserId == userId &&
                     s.TenantId == tenantId
            );

            if (student == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "No pertenecés a este negocio."
                );
            }

            var (startOfMonth, startOfNextMonth) =
                GetMonthRange(year, month);

            var payments = await _paymentRepository.GetAllAsync(
                p => p.UserId == userId &&
                     p.TenantId == tenantId &&
                     p.PlanType == PlanType.STUDENT &&
                     p.PaymentDate >= startOfMonth &&
                     p.PaymentDate < startOfNextMonth,
                p => p.User,
                p => p.Tenant
            );

            return await MapPaymentsWithPlanName(payments);
        }

        public async Task<MyTenantPaymentStatusDTO> GetMyTenantPaymentStatus(
    int userId,
    int tenantId)
        {
            var tenant = await _tenantRepository.GetOneAsync(
                t => t.Id == tenantId
            );

            if (tenant == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el negocio."
                );
            }

            var student = await _studentRepository.GetOneAsync(
                s => s.UserId == userId &&
                     s.TenantId == tenantId
            );

            if (student == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "No pertenecés a este negocio."
                );
            }

            var plan = await _studentPlanRepository.GetOneAsync(
                p => p.Id == student.StudentPlanId
            );

            if (plan == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el plan del alumno."
                );
            }

            return new MyTenantPaymentStatusDTO
            {
                TenantId = tenant.Id,
                TenantName = tenant.Name,

                PlanName = plan.Name,
                PlanPrice = plan.Price,

                MonthlyFeeStatus = student.MonthlyFeeStatus,
                MonthlyFeeStatusUpdatedAt =
                    student.MonthlyFeeStatusUpdatedAt,

                MercadoPagoConnected =
                    !string.IsNullOrWhiteSpace(
                        tenant.MercadoPagoAccessToken
                    )
            };
        }

        // =========================================================
        // CREAR PAGO MERCADO PAGO
        // =========================================================

        public async Task<string> CreateMercadoPagoPayment(
            CreateMercadoPagoPaymentDTO dto)
        {
            var user = await _userRepository.GetOneAsync(
                u => u.Id == dto.UserId
            );

            if (user == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un usuario con el Id = '{dto.UserId}'"
                );
            }

            var tenant = await _tenantRepository.GetOneAsync(
                t => t.Id == dto.TenantId
            );

            if (tenant == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un tenant con el Id = '{dto.TenantId}'"
                );
            }

            decimal amount;
            string planName;

            switch (dto.PlanType)
            {
                case PlanType.STUDENT:

                    var studentPlan =
                        await _studentPlanRepository.GetOneAsync(
                            p => p.Id == dto.PlanId
                        );

                    if (studentPlan == null)
                    {
                        throw new HttpResponseError(
                            HttpStatusCode.NotFound,
                            $"No se encontró un plan de estudiante con el Id = '{dto.PlanId}'"
                        );
                    }

                    amount = studentPlan.Price;
                    planName = studentPlan.Name;

                    break;

                case PlanType.TENANT:

                    var tenantPlan =
                        await _tenantPlanRepository.GetOneAsync(
                            p => p.Id == dto.PlanId
                        );

                    if (tenantPlan == null)
                    {
                        throw new HttpResponseError(
                            HttpStatusCode.NotFound,
                            $"No se encontró un plan de tenant con el Id = '{dto.PlanId}'"
                        );
                    }

                    amount = tenantPlan.Price;
                    planName = tenantPlan.Name;

                    break;

                default:

                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "Tipo de plan inválido"
                    );
            }

            if (amount <= 0)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El monto del plan debe ser mayor a 0"
                );
            }

            var payment = new Payment
            {
                UserId = dto.UserId,
                PlanId = dto.PlanId,
                PlanType = dto.PlanType,
                TenantId = dto.TenantId,
                Amount = amount,
                PaymentMethod = PaymentMethod.MERCADO_PAGO,
                PaymentDate = DateTime.UtcNow,
                Status = PaymentStatus.PENDING,
                ExternalPaymentId = null
            };

            await _paymentRepository.CreateOneAsync(payment);

            var checkoutUrl =
                await _mercadoPagoServices.CreatePreference(
                    tenant,
                    payment,
                    user,
                    planName
                );

            return checkoutUrl;
        }

        public async Task<string> CreateMercadoPagoStudentPayment(
            int userId,
            int tenantId)
        {
            var user = await _userRepository.GetOneAsync(
                u => u.Id == userId
            );

            if (user == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el usuario."
                );
            }

            var tenant = await _tenantRepository.GetOneAsync(
                t => t.Id == tenantId
            );

            if (tenant == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el negocio."
                );
            }

            var student = await _studentRepository.GetOneAsync(
                s => s.UserId == userId &&
                     s.TenantId == tenantId
            );

            if (student == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "No pertenecés a este negocio."
                );
            }

            var studentPlan = await _studentPlanRepository.GetOneAsync(
                p => p.Id == student.StudentPlanId
            );

            if (studentPlan == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el plan del alumno."
                );
            }

            if (studentPlan.Price <= 0)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El monto del plan debe ser mayor a 0."
                );
            }

            if (string.IsNullOrWhiteSpace(tenant.MercadoPagoAccessToken))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Este negocio no tiene Mercado Pago conectado."
                );
            }

            var (startOfMonth, startOfNextMonth) =
                GetMonthRange(
                    DateTime.UtcNow.Year,
                    DateTime.UtcNow.Month
                );

            var existingPayment =
                await _paymentRepository.GetOneAsync(
                    p =>
                        p.UserId == userId &&
                        p.TenantId == tenantId &&
                        p.PlanType == PlanType.STUDENT &&
                        p.PaymentDate >= startOfMonth &&
                        p.PaymentDate < startOfNextMonth &&
                        (
                            p.Status == PaymentStatus.PENDING ||
                            p.Status == PaymentStatus.PAID
                        )
                );

            // =========================================================
            // Ya existe un pago para este mes
            // =========================================================

            if (existingPayment != null)
            {
                // -----------------------------------------------------
                // Si ya está pagado, no permitimos otro pago
                // -----------------------------------------------------

                if (existingPayment.Status == PaymentStatus.PAID)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "Ya realizaste el pago de este mes."
                    );
                }

                // -----------------------------------------------------
                // Si está pendiente, reutilizamos el mismo Payment
                // y generamos nuevamente el Checkout de Mercado Pago
                // -----------------------------------------------------

                var existingCheckoutUrl =
                    await _mercadoPagoServices.CreatePreference(
                        tenant,
                        existingPayment,
                        user,
                        studentPlan.Name
                    );

                return existingCheckoutUrl;
            }

            // =========================================================
            // No existe pago para este mes → crear uno nuevo
            // =========================================================

            var payment = new Payment
            {
                UserId = userId,
                PlanId = studentPlan.Id,
                PlanType = PlanType.STUDENT,
                TenantId = tenantId,
                Amount = studentPlan.Price,
                PaymentMethod = PaymentMethod.MERCADO_PAGO,
                PaymentDate = DateTime.UtcNow,
                Status = PaymentStatus.PENDING,
                ExternalPaymentId = null
            };

            await _paymentRepository.CreateOneAsync(payment);

            var checkoutUrl =
                await _mercadoPagoServices.CreatePreference(
                    tenant,
                    payment,
                    user,
                    studentPlan.Name
                );

            return checkoutUrl;
        }
        // =========================================================
        // ELIMINAR
        // =========================================================

        public async Task DeleteOne(int id)
        {
            var payment = await _paymentRepository.GetOneAsync(
                p => p.Id == id
            );

            if (payment == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un pago con el Id = '{id}'"
                );
            }

            await _paymentRepository.DeleteOneAsync(payment);
        }

        // =========================================================
        // ACTUALIZAR
        // =========================================================

        public async Task<ResponsePaymentDTO> UpdateOne(
             int id,
             UpdatePaymentDTO updatePaymentDTO)
        {
            var payment = await _paymentRepository.GetOneAsync(
                p => p.Id == id,
                p => p.User,
                p => p.Tenant
            );

            if (payment == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un pago con el Id = '{id}'"
                );
            }

            if (updatePaymentDTO.PaymentMethod != null)
            {
                var paymentMethod = updatePaymentDTO.PaymentMethod;

                if (paymentMethod != PaymentMethod.CASH &&
                    paymentMethod != PaymentMethod.DEBIT_CARD &&
                    paymentMethod != PaymentMethod.BANK_TRANSFER &&
                    paymentMethod != PaymentMethod.MERCADO_PAGO)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        $"No existe el método de pago con el nombre = '{paymentMethod}'"
                    );
                }

                payment.PaymentMethod = paymentMethod;
            }

            await _paymentRepository.UpdateOneAsync(payment);

            return _mapper.Map<ResponsePaymentDTO>(payment);
        }

        // =========================================================
        // WEBHOOK MERCADO PAGO
        // =========================================================

        public async Task ProcessMercadoPagoWebhook(
            MercadoPagoWebhookDTO webhook)
        {
            if (webhook.Type != "payment")
            {
                return;
            }

            if (webhook.Data == null ||
                string.IsNullOrWhiteSpace(webhook.Data.Id))
            {
                return;
            }

            var mercadoPagoPaymentId =
                webhook.Data.Id;

            var tenant =
                await _tenantRepository
                    .GetByMercadoPagoUserIdAsync(
                        webhook.UserId.ToString()
                    );

            if (tenant == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el tenant asociado a la cuenta de Mercado Pago."
                );
            }

            var mercadoPagoPayment =
                await _mercadoPagoServices.GetPayment(
                    tenant,
                    mercadoPagoPaymentId
                );

            if (string.IsNullOrWhiteSpace(
                mercadoPagoPayment.ExternalReference))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El pago de Mercado Pago no tiene external_reference."
                );
            }

            if (!int.TryParse(
                mercadoPagoPayment.ExternalReference,
                out var paymentId))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El external_reference del pago no es válido."
                );
            }

            var payment =
                await _paymentRepository.GetOneAsync(
                    p => p.Id == paymentId
                );

            if (payment == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró el pago de TurnoFacil con el Id = '{paymentId}'."
                );
            }

            if (payment.TenantId != tenant.Id)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El pago no pertenece al tenant asociado a Mercado Pago."
                );
            }

            if (payment.Amount !=
                mercadoPagoPayment.TransactionAmount)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El monto del pago no coincide con el monto registrado."
                );
            }

            if (mercadoPagoPayment.CurrencyId != "ARS")
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La moneda del pago no es válida."
                );
            }

            payment.ExternalPaymentId =
                mercadoPagoPayment.Id.ToString();

            switch (mercadoPagoPayment.Status)
            {
                case "approved":

                    payment.Status = PaymentStatus.PAID;

                    if (payment.PlanType == PlanType.STUDENT)
                    {
                        var student = await _studentRepository.GetOneAsync(
                            s => s.UserId == payment.UserId &&
                                 s.TenantId == payment.TenantId
                        );

                        if (student != null)
                        {
                            student.MonthlyFeeStatus = MonthlyFeeStatus.PAID;
                            student.MonthlyFeeStatusUpdatedAt = DateTime.UtcNow;

                            await _studentRepository.UpdateOneAsync(student);
                        }
                    }
                    else if (payment.PlanType == PlanType.TENANT)
                    {
                        var tenantPayment = await _tenantRepository.GetOneAsync(
                            t => t.Id == payment.TenantId
                        );

                        if (tenantPayment != null)
                        {
                            tenantPayment.MonthlyFeeStatus = MonthlyFeeStatus.PAID;
                            tenantPayment.MonthlyFeeStatusUpdatedAt = DateTime.UtcNow;

                            await _tenantRepository.UpdateOneAsync(tenantPayment);
                        }
                    }

                    break;

                case "rejected":
                    payment.Status = PaymentStatus.REJECTED;
                    break;

                case "cancelled":
                    payment.Status = PaymentStatus.CANCELLED;
                    break;

                case "pending":
                case "in_process":
                    payment.Status = PaymentStatus.PENDING;
                    break;
            }

            await _paymentRepository.UpdateOneAsync(payment);
        }

        // =========================================================
        // OBTENER UN PAGO
        // =========================================================

        public async Task<ResponsePaymentDTO> GetOne(
            int paymentId,
            int userId)
        {
            var payment = await _paymentRepository.GetOneAsync(
                p => p.Id == paymentId,
                p => p.User,
                p => p.Tenant
            );

            if (payment == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el pago."
                );
            }

            // El usuario solamente puede consultar sus propios pagos
            if (payment.UserId != userId)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "No tenés permisos para consultar este pago."
                );
            }

            var result = _mapper.Map<ResponsePaymentDTO>(payment);

            // Obtener nombre del plan
            if (payment.PlanType == PlanType.STUDENT)
            {
                var plan = await _studentPlanRepository.GetOneAsync(
                    p => p.Id == payment.PlanId
                );

                if (plan != null)
                {
                    result.PlanName = plan.Name;
                }
            }
            else if (payment.PlanType == PlanType.TENANT)
            {
                var plan = await _tenantPlanRepository.GetOneAsync(
                    p => p.Id == payment.PlanId
                );

                if (plan != null)
                {
                    result.PlanName = plan.Name;
                }
            }

            return result;
        }

        // =========================================================
        // PAGOS DE MIS NEGOCIOS
        // =========================================================

        public async Task<List<ResponseMyBusinessPaymentDTO>> GetMyBusinessPayments(
            int userId,
            int year,
            int month)
        {
            var tenants = await _tenantRepository.GetMyOwnedTenants(userId);

            var (startOfMonth, startOfNextMonth) =
                GetMonthRange(year, month);

            var result = new List<ResponseMyBusinessPaymentDTO>();

            foreach (var tenant in tenants)
            {
                var plan = await _tenantPlanRepository.GetOneAsync(
                    p => p.Id == tenant.TenantPlanId
                );

                if (plan == null)
                {
                    continue;
                }

                var payment = await _paymentRepository.GetOneAsync(
                    p =>
                        p.UserId == userId &&
                        p.TenantId == tenant.Id &&
                        p.PlanType == PlanType.TENANT &&
                        p.PaymentDate >= startOfMonth &&
                        p.PaymentDate < startOfNextMonth
                );

                var monthlyFeeStatus =
                    payment?.Status == PaymentStatus.PAID
                        ? MonthlyFeeStatus.PAID
                        : MonthlyFeeStatus.PENDING;

                result.Add(new ResponseMyBusinessPaymentDTO
                {
                    TenantId = tenant.Id,
                    TenantName = tenant.Name,

                    PlanName = plan.Name,
                    PlanPrice = plan.Price,

                    MonthlyFeeStatus = monthlyFeeStatus,

                    MonthlyFeeStatusUpdatedAt =
                        payment?.Status == PaymentStatus.PAID
                            ? payment.PaymentDate
                            : null,

                    MercadoPagoConnected =
                        !string.IsNullOrWhiteSpace(
                            tenant.MercadoPagoAccessToken
                        )
                });
            }

            return result;
        }
    }
}