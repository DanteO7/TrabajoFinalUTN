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
    public class ProfessorServices
    {
        private readonly IProfessorRepository _professorRepository;
        private readonly IUserRepository _userRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IMapper _mapper;
        public ProfessorServices(IProfessorRepository professorRepository, IUserRepository userRepository, ITenantRepository tenantRepository, IMapper mapper)
        {
            _professorRepository = professorRepository;
            _userRepository = userRepository;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
        }

        public async Task<Professor> AssignOne(AssignProfessorDTO assignProfessorDTO)
        {
            var user = await _userRepository.GetOneAsync(u => u.Id == assignProfessorDTO.UserId);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{assignProfessorDTO.UserId}'");
            }

            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == assignProfessorDTO.TenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{assignProfessorDTO.TenantId}'");
            }

            var professor = _mapper.Map<Professor>(assignProfessorDTO);
            professor.IsActive = false;

            await _professorRepository.CreateOneAsync(professor);
            return professor;
        }

        public async Task<List<Professor>> GetAll (int? tenantId)
        {
            IQueryable<Professor> query = _professorRepository.Query();

            if (tenantId != null)
            {
                query = query.Where(p => p.TenantId == tenantId);
            }
            var professors = await query.ToListAsync();
            return professors;
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

        public async Task<Professor> ChangeActive(int id)
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
