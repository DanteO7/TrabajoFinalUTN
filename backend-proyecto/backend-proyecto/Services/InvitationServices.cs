using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using System.Net;

namespace backend_proyecto.Services
{
    public class InvitationServices
    {
        private readonly IInvitationRepository _invitationRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IProfessorRepository _professorRepository;
        private readonly IUserRepository _userRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IStudentPlanRepository _studentPlanRepository;
        private readonly StudentServices _studentServices;
        private readonly ProfessorServices _professorServices;


        public InvitationServices(
            IInvitationRepository invitationRepository,
            IStudentRepository studentRepository,
            IProfessorRepository professorRepository,
            IUserRepository userRepository,
            ITenantRepository tenantRepository,
            IStudentPlanRepository studentPlanRepository,
            StudentServices studentServices,
            ProfessorServices professorServices
            )
        {
            _invitationRepository = invitationRepository;
            _studentRepository = studentRepository;
            _professorRepository = professorRepository;
            _userRepository = userRepository;
            _tenantRepository = tenantRepository;
            _studentPlanRepository = studentPlanRepository;
            _studentServices = studentServices;
            _professorServices = professorServices;
        }

        public async Task<ResponseInvitationDTO> CreateInvitation(CreateInvitationDTO dto)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == dto.TenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    $"No se encontró un tenant con el Id = '{dto.TenantId}'");
            }

            // ← Eliminar la invitación anterior
            var oldInvitation = await _invitationRepository.GetOneAsync(i => i.TenantId == dto.TenantId && i.Role == dto.Role);
            if (oldInvitation != null)
            {
                await _invitationRepository.DeleteOneAsync(oldInvitation);
            }

            var invitation = new Invitation
            {
                TenantId = dto.TenantId,
                Role = dto.Role,
                Token = Guid.NewGuid(),
                ExpirationDate = DateTime.UtcNow.AddDays(7)
            };

            await _invitationRepository.CreateOneAsync(invitation);

            return new ResponseInvitationDTO
            {
                Id = invitation.Id,
                Link = $"https://turnofacilapp.com.ar/invitacion/{invitation.Token}",
                ExpirationDate = invitation.ExpirationDate
            };
        }

        public async Task AcceptInvitation(Guid token, int userId, int? studentPlanId)
        {
            var invitation = await _invitationRepository.GetOneAsync(i => i.Token == token);
            if (invitation == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    "La invitación no existe o el link es inválido");
            }

            if (DateTime.UtcNow > invitation.ExpirationDate)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "La invitación ha expirado");
            }

            if (invitation.Role == Roles.STUDENT)
            {
                await AcceptAsStudent(invitation, userId, studentPlanId);
            }
            else if (invitation.Role == Roles.PROFESSOR)
            {
                await AcceptAsProfessor(invitation, userId);
            }
        }

        private async Task AcceptAsStudent(
            Invitation invitation,
            int userId,
            int? studentPlanId)
        {
            if (studentPlanId == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Debés seleccionar un plan para unirte como alumno"
                );
            }

            await _studentServices.AssignOne(new AssignStudentDTO
            {
                UserId = userId,
                TenantId = invitation.TenantId,
                StudentPlanId = studentPlanId.Value
            });
        }

        private async Task AcceptAsProfessor(Invitation invitation, int userId)
        {
            await _professorServices.AssignOne(new AssignProfessorDTO
            {
                UserId = userId,
                TenantId = invitation.TenantId
            });
        }

        public async Task<ResponseInvitationInfoDTO> GetInvitationInfo(Guid token)
        {
            var invitation = await _invitationRepository.GetOneAsync(
                i => i.Token == token,
                i => i.Tenant);

            if (invitation == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    "La invitación no existe o el link es inválido");
            }

            if (DateTime.UtcNow > invitation.ExpirationDate)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "La invitación ha expirado");
            }

            return new ResponseInvitationInfoDTO
            {
                Id = invitation.Id,
                TenantId = invitation.TenantId, 
                TenantName = invitation.Tenant.Name,
                Role = invitation.Role,
                ExpirationDate = invitation.ExpirationDate
            };
        }
        public async Task DeleteInvitation(int id)
        {
            var invitation = await _invitationRepository.GetOneAsync(i => i.Id == id);
            if (invitation == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    $"No se encontró una invitación con el Id = '{id}'");
            }

            await _invitationRepository.DeleteOneAsync(invitation);
        }

        public async Task<ResponseInvitationDTO> GetInvitationByTenant(int tenantId, string role)
        {
            var invitation = await _invitationRepository.GetOneAsync(
                i => i.TenantId == tenantId && i.Role == role);
            if (invitation == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, "No hay invitación activa");
            }

            return new ResponseInvitationDTO
            {
                Id = invitation.Id,
                Link = $"http://localhost:5173/invitacion/{invitation.Token}",
                ExpirationDate = invitation.ExpirationDate
            };
        }
    }
}