using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using System.Net;

namespace backend_proyecto.Services
{
    public class SpecialityServices
    {
        private readonly ISpecialityRepository _specialityRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IMapper _mapper;
        public SpecialityServices(ISpecialityRepository specialityRepository, ITenantRepository tenantRepository, IMapper mapper)
        {
            _specialityRepository = specialityRepository;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
        }
        
        public async Task<List<ResponseSpecialityDTO>> GetAllByTenantId(int tenantId)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id  == tenantId);
            if(tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{tenantId}'");
            }

            var specialities = await _specialityRepository.GetAllAsync(s => s.TenantId == tenantId, s => s.Tenant);
            return _mapper.Map<List<ResponseSpecialityDTO>>(specialities);
        }

        public async Task<ResponseSpecialityDTO> CreateOne(CreateSpecialityDTO createSpecialityDTO)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == createSpecialityDTO.TenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{createSpecialityDTO.TenantId}'");
            }
            if (createSpecialityDTO.Name != null && createSpecialityDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del plan no puede ser nulo o tener mas de 50 caracteres");
            }
            if(createSpecialityDTO.Name != null && await _specialityRepository.ExistsByName(createSpecialityDTO.Name))
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"Ya existe una especialidad con ese nombre");
            }

            var speciality = _mapper.Map<Speciality>(createSpecialityDTO);
            await _specialityRepository.CreateOneAsync(speciality);
            return _mapper.Map<ResponseSpecialityDTO>(speciality);
        }

        public async Task DeleteOne(int id)
        {
            var speciality = await _specialityRepository.GetOneAsync(s => s.Id == id);
            if (speciality == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una especialidad con el Id = '{id}'");
            }

            await _specialityRepository.DeleteOneAsync(speciality);
        }

        public async Task<ResponseSpecialityDTO> UpdateOne(int id, UpdateSpecialityDTO updateSpecialityDTO)
        {
            var speciality = await _specialityRepository.GetOneAsync(s => s.Id == id, s => s.Tenant);
            if (speciality == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una especialidad con el Id = '{id}'");
            }

            if (updateSpecialityDTO.Name != null && updateSpecialityDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del plan no puede tener mas de 50 caracteres");
            }

            _mapper.Map(updateSpecialityDTO, speciality);
            await _specialityRepository.UpdateOneAsync(speciality);
            return _mapper.Map<ResponseSpecialityDTO>(speciality);
        }
    }
}
