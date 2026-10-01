using AutoMapper;
using backend_projeto.Models.DTOs;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using System.Net;
using Microsoft.AspNetCore.DataProtection;

namespace backend_proyecto.Services
{
    public class TenantServices
    {
        private readonly ITenantRepository _tenantRepository;
        private readonly ITenantPlanRepository _tenantPlanRepository;
        private readonly IUserRepository _userRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IProfessorRepository _professorRepository;
        private readonly IMapper _mapper;
        private readonly IAdminRepository _adminRepository;
        private readonly PermissionServices _permissionServices;
        private readonly EmailServices _emailServices; 
        private readonly IDataProtector _tenantRequestProtector;

        public TenantServices(
            ITenantRepository tenantRepository,
            ITenantPlanRepository tenantPlanRepository,
            IUserRepository userRepository,
            IStudentRepository studentRepository,
            IProfessorRepository professorRepository,
            IMapper mapper,
            IAdminRepository adminRepository,
            PermissionServices permissionServices,
            EmailServices emailServices,
            IDataProtectionProvider dataProtectionProvider)
        {
            _tenantRepository = tenantRepository;
            _tenantPlanRepository = tenantPlanRepository;
            _userRepository = userRepository;
            _studentRepository = studentRepository;
            _professorRepository = professorRepository;
            _mapper = mapper;
            _adminRepository = adminRepository;
            _permissionServices = permissionServices;
            _emailServices = emailServices;
            _tenantRequestProtector = dataProtectionProvider.CreateProtector("TurnoFacil.TenantRequest");
        }

        public async Task<List<ResponseTenantDTO>> GetAll(int userId)
        {
            var isAdmin = await _adminRepository.ExistsByUserId(userId);

            if (!isAdmin)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "Solo un administrador puede buscar todos los negocio"
                );
            }
            var tenants = await _tenantRepository.GetAllAsync(null, t => t.OwnerUser, t => t.TenantPlan);
            return _mapper.Map<List<ResponseTenantDTO>>(tenants);
        }

        public async Task<ResponseTenantDTO> GetById(int id, int userId)
        {
            await _permissionServices.CheckPermission(Permissions.TENANT_READ);

            var tenant = await _tenantRepository.GetOneAsync(
                t => t.Id == id,
                t => t.OwnerUser,
                t => t.TenantPlan,
                t => t.Professors,
                t => t.Students
            );

            if (tenant == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No existe el tenant"
                );
            }

            var hasAccess =
                tenant.OwnerUserId == userId ||
                tenant.Professors.Any(p => p.UserId == userId) ||
                tenant.Students.Any(s => s.UserId == userId);

            if (!hasAccess)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No existe el tenant"
                );
            }


            var response = _mapper.Map<ResponseTenantDTO>(tenant);
            response.Role = GetRole(tenant, userId);

            return response;
        }

        public async Task<List<ResponseMyTenantDTO>> GetAllByUserId(
             int targetUserId,
             int userId)
        {
            var isAdmin = await _adminRepository.ExistsByUserId(userId);

            if (!isAdmin)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "Solo un administrador puede consultar los negocios de un usuario"
                );
            }

            return await _tenantRepository.GetMyTenants(
                targetUserId,
                null
            );
        }

        public async Task<ResponseTenantDTO> CreateOne(CreateTenantDTO createTenantDTO, int userId)
        {
            var isAdmin = await _adminRepository.ExistsByUserId(userId);

            if (!isAdmin)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "Solo un administrador puede crear un negocio"
                );
            }

            var user = await _userRepository.GetOneAsync(p => p.Id == createTenantDTO.OwnerUserId);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    $"No existe Usuario con el Id = '{createTenantDTO.OwnerUserId}'");
            }

            var plan = await _tenantPlanRepository.GetOneAsync(p => p.Id == createTenantDTO.TenantPlanId);
            if (plan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    $"No existe plan de Tenant con el Id = '{createTenantDTO.TenantPlanId}'");
            }

            var existingTenant = await _tenantRepository.GetOneAsync(t =>
                t.OwnerUserId == createTenantDTO.OwnerUserId &&
                t.Name == createTenantDTO.Name);

            if (existingTenant != null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    $"Ya existe un tenant con el nombre '{createTenantDTO.Name}' para este usuario");
            }

            var tenant = new Tenant
            {
                OwnerUserId = createTenantDTO.OwnerUserId,
                Name = createTenantDTO.Name,
                IsActive = true,
                TenantPlanId = createTenantDTO.TenantPlanId,
                MonthlyFeeStatus = MonthlyFeeStatus.PAID,
                PaymentDueDate = DateTime.UtcNow.AddDays(30)
            };

            await _tenantRepository.CreateOneAsync(tenant);

            user.HasActiveTenantRequest = false;

            await _userRepository.UpdateOneAsync(user);

            // Crear automáticamente el Professor para el dueño
            var professor = new Professor
            {
                UserId = createTenantDTO.OwnerUserId,
                TenantId = tenant.Id,
                IsActive = true
            };

            await _professorRepository.CreateOneAsync(professor);

            return _mapper.Map<ResponseTenantDTO>(tenant);
        }

        public async Task DeleteOne(int id, int userId)
        {
            var isAdmin = await _adminRepository.ExistsByUserId(userId);

            if (!isAdmin)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "Solo un administrador puede eliminar un negocio"
                );
            }

            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == id);
            if(tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No existe Tenant con el Id = '{id}'");
            }
            await _tenantRepository.DeleteOneAsync(tenant);
        }

        public async Task<ResponseTenantDTO> UpdateOne(int id, UpdateTenantDTO updateTenantDTO)
        {
            await _permissionServices.CheckPermission(Permissions.TENANT_UPDATE);

            var tenant = await _tenantRepository.GetOneAsync(
                t => t.Id == id,
                t => t.OwnerUser,
                t => t.TenantPlan
            );

            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{id}'");
            }

            if (updateTenantDTO.Name != null)
            {
                if (updateTenantDTO.Name.Length > 50)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest, "El nombre no puede tener más de 50 caracteres");
                }
                tenant.Name = updateTenantDTO.Name;
            }
            var tenantWithSameName = await _tenantRepository.GetOneAsync(t => t.Id != id && t.Name == updateTenantDTO.Name);

            if (tenantWithSameName != null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"Ya existe un negocio con el nombre: '{updateTenantDTO.Name}'");
            }

            if (updateTenantDTO.TenantPlanId.HasValue)
            {
                var plan = await _tenantPlanRepository.GetOneAsync(p => p.Id == updateTenantDTO.TenantPlanId.Value);

                if (plan == null)
                {
                    throw new HttpResponseError(HttpStatusCode.NotFound, $"No existe plan con Id = '{updateTenantDTO.TenantPlanId}'");
                }

                if (updateTenantDTO.TenantPlanId == tenant.TenantPlanId)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest, "El plan ya es el mismo");
                }

                tenant.TenantPlanId = updateTenantDTO.TenantPlanId.Value;
            }

            if (updateTenantDTO.Address != null)
            {
                if (updateTenantDTO.Address.Length > 200)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest,
                        "La dirección no puede tener más de 200 caracteres");
                }

                tenant.Address = updateTenantDTO.Address;
            }

            if (updateTenantDTO.SocialNetworks != null)
            {
                var validPlatforms = new[] { "facebook", "instagram", "tiktok", "x", "linkedin", "youtube", "whatsapp" };

                foreach (var (platform, url) in updateTenantDTO.SocialNetworks)
                {
                    if (!validPlatforms.Contains(platform.ToLower()))
                    {
                        throw new HttpResponseError(HttpStatusCode.BadRequest,
                            $"Red social '{platform}' no válida");
                    }

                    if (platform.ToLower() == "whatsapp")
                    {
                        if (!long.TryParse(url, out _))
                        {
                            throw new HttpResponseError(HttpStatusCode.BadRequest,
                                "WhatsApp: Ingresa solo el número de teléfono (sin símbolos)");
                        }

                        updateTenantDTO.SocialNetworks[platform] = $"https://wa.me/{url}";
                    }
                    else
                    {
                        if (!Uri.TryCreate(url, UriKind.Absolute, out _))
                        {
                            throw new HttpResponseError(HttpStatusCode.BadRequest,
                                $"URL inválida para {platform}");
                        }
                    }
                }

                tenant.SocialNetworks = updateTenantDTO.SocialNetworks;
            }

            if (updateTenantDTO.Alias != null)
            {
                tenant.Alias = updateTenantDTO.Alias.Trim();
            }

            if (updateTenantDTO.CBU != null)
            {
                tenant.CBU = updateTenantDTO.CBU.Trim();
            }

            await _tenantRepository.UpdateOneAsync(tenant);

            return _mapper.Map<ResponseTenantDTO>(tenant);
        }
        public async Task<List<ResponseMyTenantDTO>> GetMyTenants(int userId, int? targetUserId = null, bool onlyOwned = false)
        {
            var tenants = await _tenantRepository.GetMyTenants(userId, targetUserId, onlyOwned);

            return tenants;
        }
        private static string GetRole(Tenant tenant, int userId)
        {
            if (tenant.OwnerUserId == userId)
                return Roles.TENANT;

            if (tenant.Professors.Any(p => p.UserId == userId))
                return Roles.PROFESSOR;

            return Roles.STUDENT;
        }

        public async Task<List<ResponseTenantDTO>> GetMyOwnedTenants(int userId)
        {
            var tenants = await _tenantRepository.GetMyOwnedTenants(userId);

            return _mapper.Map<List<ResponseTenantDTO>>(tenants);
        }
        public async Task<List<ResponseTenantDTO>> GetPendingPaymentTenants(int userId)
        {
            var isAdmin = await _adminRepository.ExistsByUserId(userId);

            if (!isAdmin)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "Solo un administrador puede consultar los negocios sin pagar"
                );
            }
            var tenants = await _tenantRepository
                .Query()
                .Include(t => t.OwnerUser)
                .Include(t => t.TenantPlan)
                .Where(t =>
                    t.MonthlyFeeStatus != MonthlyFeeStatus.PAID
                )
                .ToListAsync();

            return _mapper.Map<List<ResponseTenantDTO>>(tenants);
        }

        public async Task RequestTenant(
            int userId,
            RequestTenantDTO dto)
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

            if (user.HasActiveTenantRequest)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Ya tenés una solicitud de negocio pendiente."
                );
            }

            if (dto.Comprobante == null ||
                dto.Comprobante.Length == 0)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Tenés que adjuntar un comprobante de pago."
                );
            }

            if (dto.Comprobante.Length > 5 * 1024 * 1024)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El comprobante no puede superar los 5 MB."
                );
            }

            var extension = Path
                .GetExtension(dto.Comprobante.FileName)
                .ToLower();

            var allowedExtensions = new[]
            {
                ".jpg",
                ".jpeg",
                ".png",
                ".pdf"
            };

            if (!allowedExtensions.Contains(extension))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El comprobante debe ser PDF, JPG o PNG."
                );
            }

            var plan = await _tenantPlanRepository.GetOneAsync(
                p => p.Id == dto.TenantPlanId
            );

            if (plan == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No existe plan de Tenant con el Id = '{dto.TenantPlanId}'"
                );
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El nombre del negocio es obligatorio."
                );
            }

            dto.Name = dto.Name.Trim();

            if (dto.Name.Length > 50)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El nombre no puede tener más de 50 caracteres."
                );
            }

            var existingTenant = await _tenantRepository.GetOneAsync(
                t =>
                    t.OwnerUserId == userId &&
                    t.Name == dto.Name
            );

            if (existingTenant != null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    $"Ya existe un negocio con el nombre '{dto.Name}' para este usuario."
                );
            }

            var tokenData = $"{userId}|{dto.Name}|{dto.TenantPlanId}";

            var token = _tenantRequestProtector.Protect(tokenData);

            await _emailServices.SendTenantRequestEmail(
                user.Email,
                $"{user.Name} {user.Surname}",
                dto.Name,
                plan.Name,
                dto.Comprobante,
                token
            );

            user.HasActiveTenantRequest = true;

            await _userRepository.UpdateOneAsync(user);
        }

        private (int userId, string name, int tenantPlanId) GetTenantData(
            string token)
        {
            string data;

            try
            {
                data = _tenantRequestProtector.Unprotect(token);
            }
            catch
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El enlace no es válido."
                );
            }

            var parts = data.Split('|');

            if (parts.Length != 3)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El enlace no es válido."
                );
            }

            if (!int.TryParse(parts[0], out var userId))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El usuario del enlace no es válido."
                );
            }

            if (!int.TryParse(parts[2], out var tenantPlanId))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El plan del enlace no es válido."
                );
            }

            return (
                userId,
                parts[1],
                tenantPlanId
            );
        }

        public async Task<object> GetTenantDataFromToken(
            int userId,
            string token)
        {
            var isAdmin =
                await _adminRepository.ExistsByUserId(userId);

            if (!isAdmin)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "Solo un administrador puede consultar los negocios sin pagar"
                );
            }

            var data = GetTenantData(token);

            var user = await _userRepository.GetOneAsync(
                u => u.Id == data.userId
            );

            if (user == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el usuario."
                );
            }

            var plan = await _tenantPlanRepository.GetOneAsync(
                p => p.Id == data.tenantPlanId
            );

            if (plan == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el plan."
                );
            }

            return new
            {
                userId = data.userId,
                userName = $"{user.Name} {user.Surname}",
                userEmail = user.Email,
                name = data.name,
                tenantPlanId = data.tenantPlanId,
                planName = plan.Name
            };
        }

        public async Task<ResponseTenantDTO> CreateTenantFromToken(
            int userId,
            CreateTenantFromTokenDTO dto)
        {
            var isAdmin = await _adminRepository.ExistsByUserId(userId);

            if (!isAdmin)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "Solo un administrador puede crear negocios."
                );
            }

            var tokenData = GetTenantData(dto.Token);

            var name = dto.Name?.Trim();

            if (string.IsNullOrWhiteSpace(name))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El nombre del negocio es obligatorio."
                );
            }

            if (name.Length > 50)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El nombre no puede tener más de 50 caracteres."
                );
            }

            var plan = await _tenantPlanRepository.GetOneAsync(
                p => p.Id == dto.TenantPlanId
            );

            if (plan == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el plan seleccionado."
                );
            }

            var createTenantDTO = new CreateTenantDTO
            {
                OwnerUserId = tokenData.userId,
                Name = name,
                TenantPlanId = dto.TenantPlanId
            };

            return await CreateOne(createTenantDTO, userId);
        }

        public async Task SendTenantCreatedEmailToOwner(
            int adminId,
            int tenantId)
        {
            var isAdmin = await _adminRepository.ExistsByUserId(adminId);

            if (!isAdmin)
            {
                throw new HttpResponseError(
                    HttpStatusCode.Forbidden,
                    "Solo un administrador puede enviar este correo."
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

            var user = await _userRepository.GetOneAsync(
                u => u.Id == tenant.OwnerUserId
            );

            if (user == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el propietario del negocio."
                );
            }

            await _emailServices.SendTenantCreatedEmail(
                user.Email,
                tenant.Name
            );
        }
    }
}
