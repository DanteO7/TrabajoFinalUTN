using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils;
using backend_proyecto.Utils.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace backend_proyecto.Services
{
    public class ActivityServices
    {
        private readonly IActivityRepository _activityRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly PermissionServices _permissionServices;
        private readonly IMapper _mapper;
        private readonly IClassRepository _classRepository;

        public ActivityServices(IActivityRepository activityRepository, ITenantRepository tenantRepository, PermissionServices permissionServices, IMapper mapper, IClassRepository classRepository)
        {
            _activityRepository = activityRepository;
            _tenantRepository = tenantRepository;
            _permissionServices = permissionServices;
            _mapper = mapper;
            _classRepository = classRepository;
        }
        
        public async Task<List<ResponseActivityDTO>> GetAllByTenantId(int tenantId, int userId)
        {
            await _permissionServices.CheckPermission(Permissions.ACTIVITY_READ);

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
            await _permissionServices.CheckPermission(Permissions.ACTIVITY_READ);

            var activity = await _activityRepository.GetOneAsync(a => a.Id == id, a => a.Tenant);
            if (activity == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una actividad con el Id = '{id}'");
            }
            return _mapper.Map<ResponseActivityDTO>(activity);
        }

        public async Task<ResponseActivityDTO> CreateOne(CreateActivityDTO createActivityDTO)
        {
            await _permissionServices.CheckPermission(Permissions.ACTIVITY_CREATE);

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
            await _permissionServices.CheckPermission(Permissions.ACTIVITY_DELETE);

            var activity = await _activityRepository.GetOneAsync(a => a.Id == id);

            if (activity == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró una actividad con el Id = '{id}'"
                );
            }

            var hasFutureClass = await _classRepository.Query()
                .AnyAsync(c =>
                    c.ActivityId == id &&
                    c.Date.ToDateTime(c.StartTime) > TimeHelper.Now()
                );

            if (hasFutureClass)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No se puede eliminar una actividad que tenga clases futuras"
                );
            }

            await _activityRepository.DeleteOneAsync(activity);
        }

        public async Task<ResponseActivityDTO> UpdateOne(int id, UpdateActivityDTO updateActivityDTO)
        {
            await _permissionServices.CheckPermission(Permissions.ACTIVITY_UPDATE);

            var activity = await _activityRepository.GetOneAsync(a => a.Id == id, a => a.Tenant);
            if (activity == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una actividad con el Id = '{id}'");
            }
            if (updateActivityDTO.Name != null && updateActivityDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del plan no puede tener mas de 50 caracteres");
            }

            var oldName = activity.Name;
            _mapper.Map(updateActivityDTO, activity);

            if (updateActivityDTO.Name != null)
            {
                // Actualizar clases futuras
                var futureClasses = await _classRepository.Query()
                    .Where(c =>
                        c.ActivityId == activity.Id &&
                        c.Date.ToDateTime(c.StartTime) > TimeHelper.Now()
                    )
                    .ToListAsync();

                // Actualizar también clases pasadas sin ActivityName
                var pastClassesWithoutName = await _classRepository.Query()
                    .Where(c =>
                        c.ActivityId == activity.Id &&
                        (c.ActivityName == "" || c.ActivityName == null)
                    )
                    .ToListAsync();

                var allClassesToUpdate = futureClasses.Concat(pastClassesWithoutName).ToList();

                foreach (var classEntity in allClassesToUpdate)
                {
                    classEntity.ActivityName = activity.Name;
                }

                if (allClassesToUpdate.Count > 0)
                {
                    await _classRepository.UpdateRangeAsync(allClassesToUpdate);
                }
            }

            await _activityRepository.UpdateOneAsync(activity);
            return _mapper.Map<ResponseActivityDTO>(activity);
        }
    }
}
