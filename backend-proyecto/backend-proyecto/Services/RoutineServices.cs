using AutoMapper;
using backend_proyecto.models.DTOs;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using System.Net;

namespace backend_proyecto.Services
{
    public class RoutineServices
    {
        private readonly IRoutineRepository _routineRepository;
        private readonly IExerciseRepository _exerciseRepository;
        private readonly PermissionServices _permissionServices;
        private readonly IMapper _mapper;
        private readonly CurrentTenantService _currentTenantService;

        public RoutineServices(
            IRoutineRepository routineRepository,
            IExerciseRepository exerciseRepository,
            PermissionServices permissionServices,
            IMapper mapper,
            CurrentTenantService currentTenantService)
        {
            _routineRepository = routineRepository;
            _exerciseRepository = exerciseRepository;
            _permissionServices = permissionServices;
            _mapper = mapper;
            _currentTenantService = currentTenantService;
        }

        public async Task<List<ResponseRoutineDTO>> GetAllByTenantId(int tenantId)
        {
            await _permissionServices.CheckPermission(Permissions.ROUTINE_READ);

            var routines = await _routineRepository.GetAllByTenantIdAsync(tenantId);

            return _mapper.Map<List<ResponseRoutineDTO>>(routines);
        }

        public async Task<ResponseRoutineDTO> GetOne(int id)
        {
            await _permissionServices.CheckPermission(Permissions.ROUTINE_READ);

            var routine = await _routineRepository.GetOneWithExercisesAsync(id);

            if (routine == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró la rutina"
                );
            }

            return _mapper.Map<ResponseRoutineDTO>(routine);
        }

        public async Task<ResponseRoutineDTO> CreateOne(
            CreateRoutineDTO createRoutineDTO)
        {
            await _permissionServices.CheckPermission(Permissions.ROUTINE_CREATE);


            var tenantId = _currentTenantService.GetRequiredTenantId();

            ValidateRoutineData(
                createRoutineDTO.Name,
                createRoutineDTO.Description
            );

            var exists = await _routineRepository.ExistsByName(
                createRoutineDTO.Name,
                tenantId
            );

            if (exists)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Ya existe una rutina con ese nombre en este negocio"
                );
            }

            var routine = _mapper.Map<Routine>(createRoutineDTO);

            routine.TenantId = tenantId;

            foreach (var exerciseDTO in createRoutineDTO.Exercises)
            {
                var exercise = await GetExerciseForTenant(
                    exerciseDTO.ExerciseId,
                    tenantId
                );

                routine.RoutineExercises.Add(new RoutineExercise
                {
                    ExerciseId = exercise.Id,
                    Sets = exerciseDTO.Sets,
                    Repetitions = exerciseDTO.Repetitions,
                    Weight = exerciseDTO.Weight,
                    Order = exerciseDTO.Order
                });
            }

            ValidateExercises(routine.RoutineExercises);

            await _routineRepository.CreateOneAsync(routine);

            return _mapper.Map<ResponseRoutineDTO>(routine);
        }

        public async Task<ResponseRoutineDTO> UpdateOne(
            int id,
            UpdateRoutineDTO updateRoutineDTO)
        {
            await _permissionServices.CheckPermission(Permissions.ROUTINE_UPDATE);


            var routine = await _routineRepository.GetOneAsync(
                r => r.Id == id,
                r => r.RoutineExercises
            );

            if (routine == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró una rutina con el Id = '{id}'"
                );
            }

            if (updateRoutineDTO.Name != null)
            {
                if (string.IsNullOrWhiteSpace(updateRoutineDTO.Name))
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "El nombre de la rutina no puede estar vacío"
                    );
                }

                if (updateRoutineDTO.Name.Length > 50)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "El nombre de la rutina no puede tener más de 50 caracteres"
                    );
                }

                var exists = await _routineRepository.ExistsByName(
                    updateRoutineDTO.Name,
                    routine.TenantId
                );

                if (exists && updateRoutineDTO.Name != routine.Name)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "Ya existe una rutina con ese nombre en este negocio"
                    );
                }
            }

            if (updateRoutineDTO.Description?.Length > 300)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La descripción de la rutina no puede tener más de 300 caracteres"
                );
            }

            routine.RoutineExercises.Clear();

            foreach (var exerciseDTO in updateRoutineDTO.Exercises)
            {
                var exercise = await GetExerciseForTenant(
                    exerciseDTO.ExerciseId,
                    routine.TenantId
                );

                routine.RoutineExercises.Add(new RoutineExercise
                {
                    RoutineId = routine.Id,
                    ExerciseId = exercise.Id,
                    Sets = exerciseDTO.Sets,
                    Repetitions = exerciseDTO.Repetitions,
                    Weight = exerciseDTO.Weight,
                    Order = exerciseDTO.Order
                });
            }

            ValidateExercises(routine.RoutineExercises);

            _mapper.Map(updateRoutineDTO, routine);

            if (updateRoutineDTO.Exercises != null)
            {
                routine.RoutineExercises.Clear();

                foreach (var exerciseDTO in updateRoutineDTO.Exercises)
                {
                    var exercise = await GetExerciseForTenant(
                        exerciseDTO.ExerciseId,
                        routine.TenantId
                    );

                    routine.RoutineExercises.Add(new RoutineExercise
                    {
                        RoutineId = routine.Id,
                        ExerciseId = exercise.Id,
                        Sets = exerciseDTO.Sets,
                        Repetitions = exerciseDTO.Repetitions,
                        Weight = exerciseDTO.Weight,
                        Order = exerciseDTO.Order
                    });
                }

                ValidateExercises(routine.RoutineExercises);
            }

            await _routineRepository.UpdateOneAsync(routine);
            var updatedRoutine = await _routineRepository.GetOneWithExercisesAsync(routine.Id);
            return _mapper.Map<ResponseRoutineDTO>(updatedRoutine);
        }

        public async Task DeleteOne(int id)
        {
            await _permissionServices.CheckPermission(Permissions.ROUTINE_DELETE);


            var routine = await _routineRepository.GetOneAsync(
                r => r.Id == id
            );

            if (routine == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró una rutina con el Id = '{id}'"
                );
            }

            await _routineRepository.DeleteOneAsync(routine);
        }

        private async Task<Exercise> GetExerciseForTenant(
            int exerciseId,
            int tenantId)
        {
            var exercise = await _exerciseRepository.GetOneAsync(
                e =>
                    e.Id == exerciseId &&
                    e.TenantId == tenantId
            );

            if (exercise == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    $"El ejercicio con Id = '{exerciseId}' no existe o no pertenece a este negocio"
                );
            }

            return exercise;
        }

        private static void ValidateRoutineData(
            string? name,
            string? description)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El nombre de la rutina es obligatorio"
                );
            }

            if (name.Length > 50)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El nombre de la rutina no puede tener más de 50 caracteres"
                );
            }

            if (description?.Length > 300)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La descripción de la rutina no puede tener más de 300 caracteres"
                );
            }
        }

        private static void ValidateExercises(
            ICollection<RoutineExercise> exercises)
        {
            var duplicateOrders = exercises
                .GroupBy(e => e.Order)
                .Any(g => g.Count() > 1);

            if (duplicateOrders)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No puede haber dos ejercicios con el mismo Order en una rutina"
                );
            }

            var duplicateExercises = exercises
                .GroupBy(e => e.ExerciseId)
                .Any(g => g.Count() > 1);

            if (duplicateExercises)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No se puede agregar el mismo ejercicio más de una vez a una rutina"
                );
            }
        }
    }
}