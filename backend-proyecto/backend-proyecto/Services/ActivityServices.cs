using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using System.Net;

namespace backend_proyecto.Services
{
    public class ActivityServices
    {
        private readonly IActivityRepository _activityRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly PermissionServices _permissionServices;
        private readonly IMapper _mapper;
        public ActivityServices(IActivityRepository activityRepository, ITenantRepository tenantRepository, PermissionServices permissionServices, IMapper mapper)
        {
            _activityRepository = activityRepository;
            _tenantRepository = tenantRepository;
            _permissionServices = permissionServices;
            _mapper = mapper;
        }
        
        public async Task<List<ResponseActivityDTO>> GetAllByTenantId(int tenantId, int userId)
        {
            var tenant = await _tenantRepository.GetOneAsync(
                t => t.Id == tenantId,
                t => t.Students,
                t => t.Professors
            );

            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{tenantId}'");
            }

            var hasAccess =
               tenant.OwnerUserId == userId ||
               tenant.Professors.Any(p => p.UserId == userId) ||
               tenant.Students.Any(s => s.UserId == userId);

            if (!hasAccess)
            {
                throw new HttpResponseError(HttpStatusCode.Forbidden, "No tenés acceso a este tenant");
            }

            var activities = await _activityRepository.GetAllAsync(a => a.TenantId == tenantId, a => a.Tenant);
            return _mapper.Map<List<ResponseActivityDTO>>(activities);
        }

        public async Task<ResponseActivityDTO> GetOne(int id)
        {
            var activity = await _activityRepository.GetOneAsync(a => a.Id == id, a => a.Tenant);
            if (activity == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una actividad con el Id = '{id}'");
            }
            return _mapper.Map<ResponseActivityDTO>(activity);
        }

        public async Task<ResponseActivityDTO> CreateOne(CreateActivityDTO createActivityDTO, int userId)
        {
            await _permissionServices.CheckPermission(userId, createActivityDTO.TenantId, Permissions.ACTIVITY_CREATE);

            var tenant = await _tenantRepository.GetOneAsync(t => t.Id == createActivityDTO.TenantId);
            if (tenant == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un tenant con el Id = '{createActivityDTO.TenantId}'");
            }
            if (createActivityDTO.Name != null && createActivityDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre de la actividad no puede ser nulo o tener mas de 50 caracteres");
            }
            if (createActivityDTO.Name != null && await _activityRepository.ExistsByName(createActivityDTO.Name, createActivityDTO.TenantId))
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"Ya existe una actividad con ese nombre en este negocio");
            }

            var activity = _mapper.Map<Activity>(createActivityDTO);
            await _activityRepository.CreateOneAsync(activity);
            return _mapper.Map<ResponseActivityDTO>(activity);
        }

        public async Task DeleteOne(int id)
        {
            var activity = await _activityRepository.GetOneAsync(a => a.Id == id);
            if (activity == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una actividad con el Id = '{id}'");
            }

            await _activityRepository.DeleteOneAsync(activity);
        }

        public async Task<ResponseActivityDTO> UpdateOne(int id, UpdateActivityDTO updateActivityDTO)
        {
            var activity = await _activityRepository.GetOneAsync(a => a.Id == id, a => a.Tenant);
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
            return _mapper.Map<ResponseActivityDTO>(activity);
        }
    }
}
