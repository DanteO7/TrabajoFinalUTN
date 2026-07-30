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

        public InvitationServices(
            IInvitationRepository invitationRepository,
            IStudentRepository studentRepository,
            IProfessorRepository professorRepository,
            IUserRepository userRepository,
            ITenantRepository tenantRepository,
            IStudentPlanRepository studentPlanRepository)
        {
            _invitationRepository = invitationRepository;
            _studentRepository = studentRepository;
            _professorRepository = professorRepository;
            _userRepository = userRepository;
            _tenantRepository = tenantRepository;
            _studentPlanRepository = studentPlanRepository;
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
                Link = $"http://localhost:5173/invitacion/{invitation.Token}",
                ExpirationDate = invitation.ExpirationDate
            };
        }

        public async Task AcceptInvitation(Guid token, int userId, int? studentPlanId)
        {
            // Buscar la invitación
            var invitation = await _invitationRepository.GetOneAsync(i => i.Token == token);
            if (invitation == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    "La invitación no existe o el link es inválido");
            }

            // Validar expiración
            if (DateTime.UtcNow > invitation.ExpirationDate)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "La invitación ha expirado");
            }

            // Validar que el usuario existe
            var user = await _userRepository.GetOneAsync(u => u.Id == userId);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    $"No se encontró un usuario con el Id = '{userId}'");
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

        private async Task AcceptAsStudent(Invitation invitation, int userId, int? studentPlanId)
        {
            // Validar que el usuario no sea ya alumno en este tenant
            var existingStudent = await _studentRepository.GetOneAsync(
                s => s.UserId == userId && s.TenantId == invitation.TenantId);

            if (existingStudent != null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "Ya sos alumno en este negocio");
            }

            // Validar que se mande un plan
            if (studentPlanId == null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "Debés seleccionar un plan para unirte como alumno");
            }

            // Validar que el plan existe y pertenece al tenant
            var studentPlan = await _studentPlanRepository.GetOneAsync(
                p => p.Id == studentPlanId && p.TenantId == invitation.TenantId);

            if (studentPlan == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    $"No se encontró un plan con el Id = '{studentPlanId}' para este negocio");
            }

            var student = new Student
            {
                UserId = userId,
                TenantId = invitation.TenantId,
                StudentPlanId = studentPlan.Id,
                MonthlyFeeStatus = MonthlyFeeStatus.PENDING
            };

            await _studentRepository.CreateOneAsync(student);
        }

        private async Task AcceptAsProfessor(Invitation invitation, int userId)
        {
            // Validar que el usuario no sea ya profesor en este tenant
            var existingProfessor = await _professorRepository.GetOneAsync(
                p => p.UserId == userId && p.TenantId == invitation.TenantId);

            if (existingProfessor != null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "Ya sos profesor en este negocio");
            }

            var professor = new Professor
            {
                UserId = userId,
                TenantId = invitation.TenantId,
                IsActive = false
            };

            await _professorRepository.CreateOneAsync(professor);
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