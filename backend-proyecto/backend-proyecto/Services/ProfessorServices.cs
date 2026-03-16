using AutoMapper;
using backend_proyecto.Config;
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
        private readonly ISpecialityRepository _specialityRepository;
        private readonly ApplicationDbContext _context;
        public ProfessorServices(IProfessorRepository professorRepository, IUserRepository userRepository, ITenantRepository tenantRepository, IMapper mapper, ISpecialityRepository specialityRepository, ApplicationDbContext context)
        {
            _professorRepository = professorRepository;
            _userRepository = userRepository;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
            _specialityRepository = specialityRepository;
            _context = context;
        }

        public async Task<ResponseProfessorDTO> AssignOne(AssignProfessorDTO assignProfessorDTO)
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
            return _mapper.Map<ResponseProfessorDTO>(professor);
        }

        public async Task<List<ResponseProfessorDTO>> GetAll (int? tenantId)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == tenantId);
            if(tenantId != null && tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{tenantId}'");

            }
            IQueryable<Professor> query = _professorRepository.Query()
                .Include(p => p.User)
                .Include(p => p.ProfessorSpecialities)
                    .ThenInclude(ps => ps.Speciality);

            if (tenantId != null)
            {
                query = query.Where(p => p.TenantId == tenantId);
            }
            var professors = await query.ToListAsync();
            return _mapper.Map<List<ResponseProfessorDTO>>(professors);
        }

        public async Task<ResponseProfessorDTO> GetOneById(int id)
        {
            var professor = await _professorRepository.GetOneAsync(p => p.Id == id, p => p.User);
            if (professor == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }

            return _mapper.Map<ResponseProfessorDTO>(professor);
        }

        public async Task DeleteOne(int id)
        {
            var professor = await _professorRepository.GetOneAsync(p => p.Id == id);
            if (professor == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }
            await _professorRepository.DeleteOneAsync(professor);
        }

        public async Task<ResponseProfessorDTO> ChangeActive(int id)
        {
            var professor = await _professorRepository.GetOneAsync(p => p.Id == id, p => p.User);
            if (professor == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }

            professor.IsActive = !professor.IsActive;
            await _professorRepository.UpdateOneAsync(professor);
            return _mapper.Map<ResponseProfessorDTO>(professor);
        }

        public async Task<ResponseProfessorDTO> AssignSpeciality(int professorId, int specialityId)
        {
            var professor = await _professorRepository.GetOneAsync(p => p.Id == professorId, p => p.User);
            if (professor == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{professorId}'");
            }

            var speciality = await _specialityRepository.GetOneAsync(s => s.Id == specialityId);
            if (speciality == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una especialidad con el Id = '{specialityId}'");
            }

            var exist = await _professorRepository.HasSpeciality(professorId, specialityId);
            if (exist)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"La especialidad con el Id = '{specialityId}' ya está asignada a el profesor con Id = '{professorId}'");
            }

            professor.ProfessorSpecialities.Add(new ProfessorSpeciality
            {
                ProfessorId = professorId,
                SpecialityId = specialityId,
            });
            await _professorRepository.UpdateOneAsync(professor);

            professor = await _professorRepository.Query()
                .Include(p => p.User)
                .Include(p => p.ProfessorSpecialities)
                    .ThenInclude(ps => ps.Speciality)
                .FirstAsync(p => p.Id == professorId);
            return _mapper.Map<ResponseProfessorDTO>(professor);
        }

        public async Task<ResponseProfessorDTO> RemoveSpeciality(int professorId, int specialityId)
        {
            var professor = await _professorRepository.GetOneAsync(p => p.Id == professorId, p => p.User, p => p.Tenant);
            if (professor == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{professorId}'");
            }

            var speciality = await _specialityRepository.GetOneAsync(s => s.Id == specialityId);
            if (speciality == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una especialidad con el Id = '{specialityId}'");
            }

            var relation = await _context.Set<ProfessorSpeciality>()
                .FirstOrDefaultAsync(ps =>
                    ps.ProfessorId == professorId &&
                    ps.SpecialityId == specialityId);
            if (relation == null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"La especialidad con el Id = '{specialityId}' no está asignada a el profesor con Id = '{professorId}'");
            }

            professor.ProfessorSpecialities.Remove(relation);
            await _professorRepository.UpdateOneAsync(professor);

            professor = await _professorRepository
                .Query()
                .Include(p => p.User)
                .Include(p => p.ProfessorSpecialities)
                    .ThenInclude(ps => ps.Speciality)
                .FirstAsync(p => p.Id == professorId);

            return _mapper.Map<ResponseProfessorDTO>(professor);
        }
    }
}
