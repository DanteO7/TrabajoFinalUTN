using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using System.Net;

namespace backend_proyecto.Services
{
    public class ActivityServices
    {
        private readonly IActivityRepository _activityRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IMapper _mapper;
        public ActivityServices(IActivityRepository activityRepository, ITenantRepository tenantRepository, IMapper mapper)
        {
            _activityRepository = activityRepository;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
        }
        
        public async Task<List<Activity>> GetAllByTenantId(int tenantId)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == tenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{tenantId}'");
            }
            return await _activityRepository.GetAllAsync(p => p.TenantId == tenantId);
        }

        public async Task<Activity> GetOne(int id)
        {
            var activity = await _activityRepository.GetOneAsync(t => t.Id == id);
            if (activity == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una actividad con el Id = '{id}'");
            }
            return activity;
        }

        public async Task<Activity> CreateOne(CreateActivityDTO createActivityDTO)
        {
            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == createActivityDTO.TenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{createActivityDTO.TenantId}'");
            }
            if (createActivityDTO.Name != null && createActivityDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del plan no puede ser nulo o tener mas de 50 caracteres");
            }
            var activity = _mapper.Map<Activity>(createActivityDTO);
            await _activityRepository.CreateOneAsync(activity);
            return activity;
        }

        public async Task DeleteOne(int id)
        {
            var activity = await _activityRepository.GetOneAsync(p => p.Id == id);
            if (activity == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una actividad con el Id = '{id}'");
            }

            await _activityRepository.DeleteOneAsync(activity);
        }

        public async Task<Activity> UpdateOne(int id, UpdateActivityDTO updateActivityDTO)
        {
            var activity = await _activityRepository.GetOneAsync(p => p.Id == id);
            if (activity == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una actividad con el Id = '{id}'");
            }
            if (updateActivityDTO.Name != null && updateActivityDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del plan no puede tener mas de 50 caracteres");
            }

            _mapper.Map(updateActivityDTO, activity);
            await _activityRepository.UpdateOneAsync(activity);
            return activity;
        }
    }
}
