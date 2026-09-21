using AutoMapper;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
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

        // =========================================================
        // MAPEAR PAGOS CON NOMBRE DEL PLAN
        // =========================================================

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
                if (
                    payment.PlanType == PlanType.STUDENT &&
                    studentPlanNames.TryGetValue(
                        payment.PlanId,
                        out var studentPlanName)
                )
                {
                    payment.PlanName = studentPlanName;
                }
                else if (
                    payment.PlanType == PlanType.TENANT &&
                    tenantPlanNames.TryGetValue(
                        payment.PlanId,
                        out var tenantPlanName)
                )
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
                p =>
                    p.UserId == userId &&
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
                p =>
                    p.TenantId == tenantId &&
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
                p =>
                    p.PlanType == PlanType.TENANT &&
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
                var userId =
                    _httpContextAccessor.HttpContext?
                        .User.FindFirst("id")?.Value;

                if (!int.TryParse(userId, out var currentUserId))
                {
                    throw new HttpResponseError(
                        HttpStatusCode.Unauthorized,
                        "No se pudo identificar al usuario."
                    );
                }

                var isAdmin =
                    await _adminRepository.ExistsByUserId(
                        currentUserId
                    );

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

            // =====================================================
            // ALUMNO
            // =====================================================

            if (createPaymentDTO.PlanType == PlanType.STUDENT)
            {
                var student = await _studentRepository.GetOneAsync(
                    s =>
                        s.UserId == createPaymentDTO.UserId &&
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

                if (
                    student.MonthlyFeeStatus == MonthlyFeeStatus.PAID &&
                    student.PaymentDueDate != null &&
                    student.PaymentDueDate.Value > DateTime.UtcNow
                )
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "El alumno ya tiene la cuota pagada y vigente."
                    );
                }

                var pendingPayment =
                    await _paymentRepository.GetOneAsync(
                        p =>
                            p.UserId == createPaymentDTO.UserId &&
                            p.TenantId == createPaymentDTO.TenantId &&
                            p.PlanType == PlanType.STUDENT &&
                            p.Status == PaymentStatus.PENDING
                    );

                if (pendingPayment != null)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "El alumno ya tiene un pago pendiente."
                    );
                }

                var amount = studentPlan.Price;

                if (amount <= 0)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "El monto del plan debe ser mayor a 0."
                    );
                }

                var paymentMethod =
                    createPaymentDTO.PaymentMethod;

                if (
                    paymentMethod != PaymentMethod.CASH &&
                    paymentMethod != PaymentMethod.DEBIT_CARD &&
                    paymentMethod != PaymentMethod.BANK_TRANSFER
                )
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        $"No existe el método de pago con el nombre = '{paymentMethod}'"
                    );
                }

                var paymentDate = DateTime.UtcNow;

                var startedNewCycle =
                    student.MonthlyFeeStatus ==
                    MonthlyFeeStatus.OVERDUE;

                var payment = new Payment
                {
                    UserId = createPaymentDTO.UserId,
                    PlanId = createPaymentDTO.PlanId,
                    PlanType = PlanType.STUDENT,
                    TenantId = createPaymentDTO.TenantId,
                    Amount = amount,
                    PaymentMethod = paymentMethod,
                    PaymentDate = paymentDate,
                    Status = PaymentStatus.PAID,
                    ExternalPaymentId = null,
                    StartedNewCycle = startedNewCycle
                };

                await _paymentRepository.CreateOneAsync(
                    payment
                );

                student.MonthlyFeeStatus =
                    MonthlyFeeStatus.PAID;

                student.MonthlyFeeStatusUpdatedAt =
                    paymentDate;

                if (startedNewCycle)
                {
                    student.PaymentDueDate =
                        paymentDate.AddDays(30);
                }

                await _studentRepository.UpdateOneAsync(
                    student
                );

                return _mapper.Map<ResponsePaymentDTO>(
                    payment
                );
            }

            // =====================================================
            // TENANT
            // =====================================================

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

            if (tenantPlan.Price <= 0)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El monto del plan debe ser mayor a 0."
                );
            }

            if (
                tenant.MonthlyFeeStatus == MonthlyFeeStatus.PAID &&
                tenant.PaymentDueDate != null &&
                tenant.PaymentDueDate.Value > DateTime.UtcNow
            )
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El negocio ya tiene la cuota pagada y vigente."
                );
            }

            var pendingTenantPayment =
                await _paymentRepository.GetOneAsync(
                    p =>
                        p.UserId == createPaymentDTO.UserId &&
                        p.TenantId == createPaymentDTO.TenantId &&
                        p.PlanType == PlanType.TENANT &&
                        p.Status == PaymentStatus.PENDING
                );

            if (pendingTenantPayment != null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El negocio ya tiene un pago pendiente."
                );
            }

            var tenantPaymentMethod =
                createPaymentDTO.PaymentMethod;

            if (
                tenantPaymentMethod != PaymentMethod.CASH &&
                tenantPaymentMethod != PaymentMethod.DEBIT_CARD &&
                tenantPaymentMethod != PaymentMethod.BANK_TRANSFER
            )
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    $"No existe el método de pago con el nombre = '{tenantPaymentMethod}'"
                );
            }

            var tenantPaymentDate = DateTime.UtcNow;

            var tenantStartedNewCycle =
                tenant.MonthlyFeeStatus ==
                MonthlyFeeStatus.OVERDUE;

            var tenantPayment = new Payment
            {
                UserId = createPaymentDTO.UserId,
                PlanId = createPaymentDTO.PlanId,
                PlanType = PlanType.TENANT,
                TenantId = createPaymentDTO.TenantId,
                Amount = tenantPlan.Price,
                PaymentMethod = tenantPaymentMethod,
                PaymentDate = tenantPaymentDate,
                Status = PaymentStatus.PAID,
                ExternalPaymentId = null,
                StartedNewCycle = tenantStartedNewCycle
            };

            await _paymentRepository.CreateOneAsync(
                tenantPayment
            );

            tenant.MonthlyFeeStatus =
                MonthlyFeeStatus.PAID;

            tenant.IsActive = true;

            tenant.MonthlyFeeStatusUpdatedAt =
                tenantPaymentDate;

            if (tenantStartedNewCycle)
            {
                tenant.PaymentDueDate =
                    tenantPaymentDate.AddDays(30);
            }

            await _tenantRepository.UpdateOneAsync(
                tenant
            );

            return _mapper.Map<ResponsePaymentDTO>(
                tenantPayment
            );
        }

        // =========================================================
        // MIS PAGOS EN UN TENANT
        // =========================================================

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
                s =>
                    s.UserId == userId &&
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
                p =>
                    p.UserId == userId &&
                    p.TenantId == tenantId &&
                    p.PlanType == PlanType.STUDENT &&
                    p.PaymentDate >= startOfMonth &&
                    p.PaymentDate < startOfNextMonth,
                p => p.User,
                p => p.Tenant
            );

            return await MapPaymentsWithPlanName(
                payments
            );
        }

        // =========================================================
        // ESTADO DE MI CUOTA
        // =========================================================

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
                s =>
                    s.UserId == userId &&
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

                MonthlyFeeStatus =
                    student.MonthlyFeeStatus,

                MonthlyFeeStatusUpdatedAt =
                    student.MonthlyFeeStatusUpdatedAt,

                MercadoPagoConnected =
                    !string.IsNullOrWhiteSpace(
                        tenant.MercadoPagoAccessToken
                    )
            };
        }

        // =========================================================
        // CREAR PAGO MERCADO PAGO - ALUMNO
        // =========================================================

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
                s =>
                    s.UserId == userId &&
                    s.TenantId == tenantId
            );

            if (student == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "No pertenecés a este negocio."
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

            if (string.IsNullOrWhiteSpace(
                tenant.MercadoPagoAccessToken))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Este negocio no tiene Mercado Pago conectado."
                );
            }

            if (
                student.MonthlyFeeStatus == MonthlyFeeStatus.PAID &&
                student.PaymentDueDate != null &&
                student.PaymentDueDate.Value > DateTime.UtcNow
            )
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Ya realizaste el pago y tu cuota todavía está vigente."
                );
            }

            var existingPayment =
                await _paymentRepository.GetOneAsync(
                    p =>
                        p.UserId == userId &&
                        p.TenantId == tenantId &&
                        p.PlanType == PlanType.STUDENT &&
                        p.Status == PaymentStatus.PENDING
                );

            if (existingPayment != null)
            {
                return await _mercadoPagoServices.CreatePreference(
                    tenant,
                    existingPayment,
                    user,
                    studentPlan.Name
                );
            }

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
                ExternalPaymentId = null,
                StartedNewCycle = false
            };

            await _paymentRepository.CreateOneAsync(
                payment
            );

            return await _mercadoPagoServices.CreatePreference(
                tenant,
                payment,
                user,
                studentPlan.Name
            );
        }

        // =========================================================
        // ELIMINAR
        // =========================================================

        public async Task DeleteOne(int id)
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

            if (payment.PlanType == PlanType.TENANT)
            {
                await _permissionServices.CheckAdminPermission(
                    Permissions.ADMIN_PAYMENTS
                );
            }
            else if (payment.PlanType == PlanType.STUDENT)
            {
                await _permissionServices.CheckPermission(
                    Permissions.PAYMENT_DELETE,
                    payment.TenantId
                );
            }

            // =====================================================
            // PAGO DE ALUMNO
            // =====================================================

            if (
                payment.PlanType == PlanType.STUDENT &&
                payment.Status == PaymentStatus.PAID
            )
            {
                var student =
                    await _studentRepository.GetOneAsync(
                        s =>
                            s.UserId == payment.UserId &&
                            s.TenantId == payment.TenantId
                    );

                if (student == null)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.NotFound,
                        "No se encontró el alumno asociado al pago."
                    );
                }

                var lastPaidPayment =
                    await _paymentRepository.Query()
                        .Where(
                            p =>
                                p.UserId == payment.UserId &&
                                p.TenantId == payment.TenantId &&
                                p.PlanType == PlanType.STUDENT &&
                                p.Status == PaymentStatus.PAID
                        )
                        .OrderByDescending(p => p.PaymentDate)
                        .FirstOrDefaultAsync();

                if (
                    lastPaidPayment == null ||
                    lastPaidPayment.Id != payment.Id
                )
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "Solo se puede eliminar el último pago del alumno."
                    );
                }

                if (payment.StartedNewCycle)
                {
                    student.MonthlyFeeStatus =
                        MonthlyFeeStatus.OVERDUE;

                    student.MonthlyFeeStatusUpdatedAt =
                        DateTime.UtcNow;

                    student.PaymentDueDate = null;
                }
                else
                {
                    student.MonthlyFeeStatus =
                        MonthlyFeeStatus.PENDING;
                }

                await _studentRepository.UpdateOneAsync(
                    student
                );
            }

            // =====================================================
            // PAGO DE TENANT
            // =====================================================

            if (
                payment.PlanType == PlanType.TENANT &&
                payment.Status == PaymentStatus.PAID
            )
            {
                var tenant =
                    await _tenantRepository.GetOneAsync(
                        t => t.Id == payment.TenantId
                    );

                if (tenant == null)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.NotFound,
                        "No se encontró el negocio asociado al pago."
                    );
                }

                var lastPaidPayment =
                    await _paymentRepository.Query()
                        .Where(
                            p =>
                                p.UserId == payment.UserId &&
                                p.TenantId == payment.TenantId &&
                                p.PlanType == PlanType.TENANT &&
                                p.Status == PaymentStatus.PAID
                        )
                        .OrderByDescending(p => p.PaymentDate)
                        .FirstOrDefaultAsync();

                if (
                    lastPaidPayment == null ||
                    lastPaidPayment.Id != payment.Id
                )
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "Solo se puede eliminar el último pago del negocio."
                    );
                }

                if (payment.StartedNewCycle)
                {
                    tenant.MonthlyFeeStatus =
                        MonthlyFeeStatus.OVERDUE;

                    tenant.MonthlyFeeStatusUpdatedAt =
                        DateTime.UtcNow;

                    tenant.PaymentDueDate = null;
                }
                else
                {
                    tenant.MonthlyFeeStatus =
                        MonthlyFeeStatus.PENDING;
                }

                await _tenantRepository.UpdateOneAsync(
                    tenant
                );
            }

            await _paymentRepository.DeleteOneAsync(
                payment
            );
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

            if (payment.PlanType == PlanType.TENANT)
            {
                await _permissionServices.CheckAdminPermission(
                    Permissions.ADMIN_PAYMENTS
                );
            }
            else if (payment.PlanType == PlanType.STUDENT)
            {
                await _permissionServices.CheckPermission(
                    Permissions.PAYMENT_UPDATE,
                    payment.TenantId
                );
            }

            if (updatePaymentDTO.PaymentMethod != null)
            {
                var paymentMethod =
                    updatePaymentDTO.PaymentMethod;

                if (
                    paymentMethod != PaymentMethod.CASH &&
                    paymentMethod != PaymentMethod.DEBIT_CARD &&
                    paymentMethod != PaymentMethod.BANK_TRANSFER &&
                    paymentMethod != PaymentMethod.MERCADO_PAGO
                )
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        $"No existe el método de pago con el nombre = '{paymentMethod}'"
                    );
                }

                payment.PaymentMethod = paymentMethod;
            }

            await _paymentRepository.UpdateOneAsync(
                payment
            );

            return _mapper.Map<ResponsePaymentDTO>(
                payment
            );
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

            if (
                webhook.Data == null ||
                string.IsNullOrWhiteSpace(webhook.Data.Id)
            )
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

            if (
                payment.Amount !=
                mercadoPagoPayment.TransactionAmount
            )
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

                    payment.Status =
                        PaymentStatus.PAID;

                    var approvalDate = DateTime.UtcNow;

                    // =================================================
                    // ALUMNO
                    // =================================================

                    if (payment.PlanType == PlanType.STUDENT)
                    {
                        var student =
                            await _studentRepository.GetOneAsync(
                                s =>
                                    s.UserId == payment.UserId &&
                                    s.TenantId == payment.TenantId
                            );

                        if (student != null)
                        {
                            var startedNewCycle =
                                student.MonthlyFeeStatus ==
                                MonthlyFeeStatus.OVERDUE;

                            payment.StartedNewCycle =
                                startedNewCycle;

                            student.MonthlyFeeStatus =
                                MonthlyFeeStatus.PAID;

                            student.MonthlyFeeStatusUpdatedAt =
                                approvalDate;

                            if (startedNewCycle)
                            {
                                student.PaymentDueDate =
                                    approvalDate.AddDays(30);
                            }

                            await _studentRepository.UpdateOneAsync(
                                student
                            );
                        }
                    }

                    // =================================================
                    // TENANT
                    // =================================================

                    else if (payment.PlanType == PlanType.TENANT)
                    {
                        var tenantPayment =
                            await _tenantRepository.GetOneAsync(
                                t => t.Id == payment.TenantId
                            );

                        if (tenantPayment != null)
                        {
                            var startedNewCycle =
                                tenantPayment.MonthlyFeeStatus ==
                                MonthlyFeeStatus.OVERDUE;

                            payment.StartedNewCycle =
                                startedNewCycle;

                            tenantPayment.MonthlyFeeStatus =
                                MonthlyFeeStatus.PAID;

                            tenantPayment.MonthlyFeeStatusUpdatedAt =
                                approvalDate;

                            tenantPayment.IsActive = true;

                            if (startedNewCycle)
                            {
                                tenantPayment.PaymentDueDate =
                                    approvalDate.AddDays(30);
                            }

                            await _tenantRepository.UpdateOneAsync(
                                tenantPayment
                            );
                        }
                    }

                    break;

                case "rejected":

                    payment.Status =
                        PaymentStatus.REJECTED;

                    break;

                case "cancelled":

                    payment.Status =
                        PaymentStatus.CANCELLED;

                    break;

                case "pending":
                case "in_process":

                    payment.Status =
                        PaymentStatus.PENDING;

                    break;
            }

            await _paymentRepository.UpdateOneAsync(
                payment
            );
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

            if (payment.UserId != userId)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "No tenés permisos para consultar este pago."
                );
            }

            var result =
                _mapper.Map<ResponsePaymentDTO>(
                    payment
                );

            if (payment.PlanType == PlanType.STUDENT)
            {
                var plan =
                    await _studentPlanRepository.GetOneAsync(
                        p => p.Id == payment.PlanId
                    );

                if (plan != null)
                {
                    result.PlanName = plan.Name;
                }
            }
            else if (payment.PlanType == PlanType.TENANT)
            {
                var plan =
                    await _tenantPlanRepository.GetOneAsync(
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
            var tenants =
                await _tenantRepository.GetMyOwnedTenants(
                    userId
                );

            var (startOfMonth, startOfNextMonth) =
                GetMonthRange(year, month);

            var result =
                new List<ResponseMyBusinessPaymentDTO>();

            foreach (var tenant in tenants)
            {
                var plan =
                    await _tenantPlanRepository.GetOneAsync(
                        p => p.Id == tenant.TenantPlanId
                    );

                if (plan == null)
                {
                    continue;
                }

                var payment =
                    await _paymentRepository.GetOneAsync(
                        p =>
                            p.UserId == userId &&
                            p.TenantId == tenant.Id &&
                            p.PlanType == PlanType.TENANT &&
                            p.Status == PaymentStatus.PAID &&
                            p.PaymentDate >= startOfMonth &&
                            p.PaymentDate < startOfNextMonth
                    );

                result.Add(
                    new ResponseMyBusinessPaymentDTO
                    {
                        TenantId = tenant.Id,
                        TenantName = tenant.Name,

                        PlanName = plan.Name,
                        PlanPrice = plan.Price,

                        MonthlyFeeStatus =
                            tenant.MonthlyFeeStatus,

                        MonthlyFeeStatusUpdatedAt =
                            tenant.MonthlyFeeStatusUpdatedAt,

                        MercadoPagoConnected =
                            !string.IsNullOrWhiteSpace(
                                tenant.MercadoPagoAccessToken
                            )
                    }
                );
            }

            return result;
        }

        // =========================================================
        // CREAR PAGO MERCADO PAGO - TENANT
        // =========================================================

        public async Task<string> CreateMercadoPagoTenantPayment(
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

            if (tenant.OwnerUserId != userId)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "No sos el dueño de este negocio."
                );
            }

            var tenantPlan =
                await _tenantPlanRepository.GetOneAsync(
                    p => p.Id == tenant.TenantPlanId
                );

            if (tenantPlan == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el plan del negocio."
                );
            }

            if (tenantPlan.Price <= 0)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El monto del plan debe ser mayor a 0."
                );
            }

            if (string.IsNullOrWhiteSpace(
                tenant.MercadoPagoAccessToken))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Este negocio no tiene Mercado Pago conectado."
                );
            }

            if (
                tenant.MonthlyFeeStatus == MonthlyFeeStatus.PAID &&
                tenant.PaymentDueDate != null &&
                tenant.PaymentDueDate.Value > DateTime.UtcNow
            )
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La cuota del negocio todavía está vigente."
                );
            }

            var existingPayment =
                await _paymentRepository.GetOneAsync(
                    p =>
                        p.UserId == userId &&
                        p.TenantId == tenantId &&
                        p.PlanType == PlanType.TENANT &&
                        p.Status == PaymentStatus.PENDING
                );

            if (existingPayment != null)
            {
                return await _mercadoPagoServices.CreatePreference(
                    tenant,
                    existingPayment,
                    user,
                    tenantPlan.Name
                );
            }

            var payment = new Payment
            {
                UserId = userId,
                PlanId = tenantPlan.Id,
                PlanType = PlanType.TENANT,
                TenantId = tenantId,
                Amount = tenantPlan.Price,
                PaymentMethod = PaymentMethod.MERCADO_PAGO,
                PaymentDate = DateTime.UtcNow,
                Status = PaymentStatus.PENDING,
                ExternalPaymentId = null,
                StartedNewCycle = false
            };

            await _paymentRepository.CreateOneAsync(
                payment
            );

            return await _mercadoPagoServices.CreatePreference(
                tenant,
                payment,
                user,
                tenantPlan.Name
            );
        }
    }
}