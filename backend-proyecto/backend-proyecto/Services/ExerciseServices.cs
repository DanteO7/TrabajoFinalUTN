using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using System.Net;

namespace backend_proyecto.Services
{
    public class ExerciseServices
    {
        private readonly IExerciseRepository _exerciseRepository;
        private readonly PermissionServices _permissionServices;
        private readonly IMapper _mapper;
        private readonly CurrentTenantService _currentTenantService;

        public ExerciseServices(
            IExerciseRepository exerciseRepository,
            PermissionServices permissionServices,
            IMapper mapper,
            CurrentTenantService currentTenantService)
        {
            _exerciseRepository = exerciseRepository;
            _permissionServices = permissionServices;
            _mapper = mapper;
            _currentTenantService = currentTenantService;
        }

        public async Task<List<ResponseExerciseDTO>> GetAllByTenantId(int tenantId)
        {
            await _permissionServices.CheckPermission(Permissions.EXERCISE_READ);


            var exercises = await _exerciseRepository.GetAllAsync(
                e => e.TenantId == tenantId
            );

            return _mapper.Map<List<ResponseExerciseDTO>>(exercises);
        }

        public async Task<ResponseExerciseDTO> GetOne(int id)
        {
            await _permissionServices.CheckPermission(Permissions.EXERCISE_READ);

            var exercise = await _exerciseRepository.GetOneAsync(
                e => e.Id == id
            );

            if (exercise == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un ejercicio con el Id = '{id}'"
                );
            }

            return _mapper.Map<ResponseExerciseDTO>(exercise);
        }

        public async Task<ResponseExerciseDTO> CreateOne(
            CreateExerciseDTO createExerciseDTO)
        {
            await _permissionServices.CheckPermission(Permissions.EXERCISE_CREATE);

            var tenantId = _currentTenantService.GetRequiredTenantId();

            if (string.IsNullOrWhiteSpace(createExerciseDTO.Name))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El nombre del ejercicio es obligatorio"
                );
            }

            if (createExerciseDTO.Name.Length > 50)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El nombre del ejercicio no puede tener más de 50 caracteres"
                );
            }

            if (createExerciseDTO.Description?.Length > 300)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La descripción del ejercicio no puede tener más de 300 caracteres"
                );
            }

            var exists = await _exerciseRepository.ExistsByName(
                createExerciseDTO.Name,
                tenantId
            );

            if (exists)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Ya existe un ejercicio con ese nombre en este negocio"
                );
            }

            var exercise = _mapper.Map<Exercise>(createExerciseDTO);

            exercise.TenantId = tenantId;

            await _exerciseRepository.CreateOneAsync(exercise);

            return _mapper.Map<ResponseExerciseDTO>(exercise);
        }

        public async Task<ResponseExerciseDTO> UpdateOne(
            int id,
            UpdateExerciseDTO updateExerciseDTO)
        {
            await _permissionServices.CheckPermission(Permissions.EXERCISE_UPDATE);

            var exercise = await _exerciseRepository.GetOneAsync(
                e => e.Id == id
            );

            if (exercise == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un ejercicio con el Id = '{id}'"
                );
            }

            if (updateExerciseDTO.Name != null)
            {
                if (string.IsNullOrWhiteSpace(updateExerciseDTO.Name))
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "El nombre del ejercicio no puede estar vacío"
                    );
                }

                if (updateExerciseDTO.Name.Length > 50)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "El nombre del ejercicio no puede tener más de 50 caracteres"
                    );
                }

                var exists = await _exerciseRepository.ExistsByName(
                    updateExerciseDTO.Name,
                    exercise.TenantId
                );

                if (exists && updateExerciseDTO.Name != exercise.Name)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "Ya existe un ejercicio con ese nombre en este negocio"
                    );
                }
            }

            if (updateExerciseDTO.Description?.Length > 300)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La descripción del ejercicio no puede tener más de 300 caracteres"
                );
            }

            _mapper.Map(updateExerciseDTO, exercise);

            await _exerciseRepository.UpdateOneAsync(exercise);

            return _mapper.Map<ResponseExerciseDTO>(exercise);
        }

        public async Task DeleteOne(int id)
        {
            await _permissionServices.CheckPermission(Permissions.EXERCISE_DELETE);

            var exercise = await _exerciseRepository.GetOneAsync(
                e => e.Id == id
            );

            if (exercise == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un ejercicio con el Id = '{id}'"
                );
            }

            await _exerciseRepository.DeleteOneAsync(exercise);
        }
    }
}