using backend_proyecto.Models;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using System.Net;

namespace backend_proyecto.Services
{
    public class ProfessorServices
    {
        private readonly IProfessorRepository _professorRepository;
        private readonly IUserRepository _userRepository;
        private readonly ITenantRepository _tenantRepository;
        public ProfessorServices(IProfessorRepository professorRepository, IUserRepository userRepository, ITenantRepository tenantRepository)
        {
            _professorRepository = professorRepository;
            _userRepository = userRepository;
            _tenantRepository = tenantRepository;
        }

        public async Task<Professor> AssignOne(int userId, int tenantId)
        {
            var user = await _userRepository.GetOneAsync(u => u.Id == userId);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{userId}'");
            }

            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == tenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{tenantId}'");
            }

            var professor = new Professor
            {
                UserId = userId,
                User = user,
                TenantId = tenantId,
                Tenant = tenant,
                IsActive = true
            };

            await _professorRepository.CreateOneAsync(professor);
            return professor;
        }

        public async Task<List<Professor>> GetAllByTenantId (int tenantId)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == tenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{tenantId}'");
            }

            return await _professorRepository.GetAllAsync(p => p.TenantId == tenantId);
        }

        public async Task<Professor> GetOneById(int id)
        {
            var professor = await _professorRepository.GetOneAsync(u => u.UserId == id);
            if (professor == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }

            return professor;
        }

        public async Task DeleteOne(int id)
        {
            var professor = await _professorRepository.GetOneAsync(p => p.UserId == id);
            if (professor == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }
            await _professorRepository.DeleteOneAsync(professor);
        }

        public async Task<Professor> ChangeStatus(int id)
        {
            var professor = await _professorRepository.GetOneAsync(p => p.UserId == id);
            if (professor == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }

            professor.IsActive = !professor.IsActive;
            await _professorRepository.UpdateOneAsync(professor);
            return professor;
        }
    }
}
