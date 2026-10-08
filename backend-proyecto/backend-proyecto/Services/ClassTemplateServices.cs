using AutoMapper;
using backend_proyecto.Config;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace backend_proyecto.Services
{
    public class ClassTemplateServices
    {
        private readonly IClassTemplateRepository _classTemplateRepository;
        private readonly IActivityRepository _activityRepository;
        private readonly IProfessorRepository _professorRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly PermissionServices _permissionServices;
        private readonly IMapper _mapper;
        private readonly IClassTemplateStudentRepository _classTemplateStudentRepository;
        private readonly CurrentTenantService _currentTenantService;
        private readonly ApplicationDbContext _db;
        private readonly IClassRepository _classRepository;
        private readonly ReservationValidationServices _reservationValidationServices;

        public ClassTemplateServices(
            IClassTemplateRepository classTemplateRepository,
            IClassTemplateStudentRepository classTemplateStudentRepository,
            IActivityRepository activityRepository,
            IProfessorRepository professorRepository,
            IStudentRepository studentRepository,
            PermissionServices permissionServices,
            CurrentTenantService currentTenantService,
            IMapper mapper,
            ApplicationDbContext db,
            IClassRepository classRepository,
            ReservationValidationServices reservationValidationServices)
        {
            _classTemplateRepository = classTemplateRepository;
            _classTemplateStudentRepository = classTemplateStudentRepository;
            _activityRepository = activityRepository;
            _professorRepository = professorRepository;
            _studentRepository = studentRepository;
            _permissionServices = permissionServices;
            _currentTenantService = currentTenantService;
            _mapper = mapper;
            _db = db;
            _classRepository = classRepository;
            _reservationValidationServices = reservationValidationServices;
        }

        public async Task<List<ResponseClassTemplateDTO>> GetAll()
        {
            await _permissionServices.CheckPermission(
                "CLASS_READ"
            );

            var tenantId = _currentTenantService.GetRequiredTenantId();

            var templates = await _classTemplateRepository
                .Query()
                .Where(x => x.TenantId == tenantId)
                .Include(x => x.Activity)
                .Include(x => x.Professor)
                    .ThenInclude(x => x.User)
                .Include(x => x.Students)
                    .ThenInclude(x => x.Student)
                        .ThenInclude(x => x.User)
                .OrderBy(x => x.DayOfWeek)
                .ThenBy(x => x.StartTime)
                .ToListAsync();

            return _mapper.Map<List<ResponseClassTemplateDTO>>(
                templates
            );
        }

        public async Task<ResponseClassTemplateDTO> GetOne(
            int id)
        {
            await _permissionServices.CheckPermission(
                "CLASS_READ"
            );

            var tenantId = _currentTenantService.GetRequiredTenantId();


            var template = await _classTemplateRepository
                .Query()
                .Where(x =>
                    x.Id == id &&
                    x.TenantId == tenantId
                )
                .Include(x => x.Activity)
                .Include(x => x.Professor)
                    .ThenInclude(x => x.User)
                .Include(x => x.Students)
                    .ThenInclude(x => x.Student)
                        .ThenInclude(x => x.User)
                .FirstOrDefaultAsync();

            if (template == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró la plantilla."
                );
            }

            return _mapper.Map<ResponseClassTemplateDTO>(
                template
            );
        }

        public async Task<ResponseClassTemplateDTO> Create(
    CreateClassTemplateDTO dto)
        {
            await _permissionServices.CheckPermission(
                "CLASS_CREATE"
            );

            var tenantId = _currentTenantService.GetRequiredTenantId();

            if (dto.StartTime >= dto.EndTime)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La hora de inicio debe ser anterior a la hora de finalización."
                );
            }

            if (dto.MaxCapacity <= 0)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La capacidad máxima debe ser mayor a 0."
                );
            }

            var activity = await _activityRepository.GetOneAsync(
                x =>
                    x.Id == dto.ActivityId &&
                    x.TenantId == tenantId
            );

            if (activity == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró la actividad en este negocio."
                );
            }

            var professor = await _professorRepository.GetOneAsync(
                x =>
                    x.Id == dto.ProfessorId &&
                    x.TenantId == tenantId
            );

            if (professor == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el profesor en este negocio."
                );
            }

            if (!professor.IsActive)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El profesor seleccionado no está activo."
                );
            }

            var hasOverlap = await _classTemplateRepository
                .Query()
                .AnyAsync(x =>
                    x.TenantId == tenantId &&
                    x.DayOfWeek == dto.DayOfWeek &&
                    x.StartTime < dto.EndTime &&
                    x.EndTime > dto.StartTime
                );

            if (hasOverlap)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Ya existe una plantilla de clase en ese horario."
                );
            }

            var classTemplate = _mapper.Map<ClassTemplate>(dto);

            classTemplate.TenantId = tenantId;

            await _classTemplateRepository.CreateOneAsync(
                classTemplate
            );

            var createdTemplate = await _classTemplateRepository
                .Query()
                .Where(x =>
                    x.Id == classTemplate.Id &&
                    x.TenantId == tenantId
                )
                .Include(x => x.Activity)
                .Include(x => x.Professor)
                    .ThenInclude(x => x.User)
                .Include(x => x.Students)
                    .ThenInclude(x => x.Student)
                        .ThenInclude(x => x.User)
                .FirstAsync();

            return _mapper.Map<ResponseClassTemplateDTO>(
                createdTemplate
            );
        }

        public async Task<ResponseClassTemplateDTO> Update(
            int id,
            UpdateClassTemplateDTO dto)
        {
            await _permissionServices.CheckPermission("CLASS_UPDATE");

            var tenantId = _currentTenantService.GetRequiredTenantId();

            if (dto.StartTime >= dto.EndTime)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La hora de inicio debe ser anterior a la hora de finalización."
                );
            }

            if (dto.MaxCapacity <= 0)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La capacidad máxima debe ser mayor a 0."
                );
            }

            var classTemplate = await _classTemplateRepository
                .Query()
                .Where(x =>
                    x.Id == id &&
                    x.TenantId == tenantId
                )
                .Include(x => x.Students)
                .FirstOrDefaultAsync();

            if (classTemplate == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró la plantilla."
                );
            }

            if (dto.MaxCapacity < classTemplate.Students.Count)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La capacidad máxima no puede ser menor a la cantidad de alumnos asignados."
                );
            }

            var activity = await _activityRepository.GetOneAsync(
                x =>
                    x.Id == dto.ActivityId &&
                    x.TenantId == tenantId
            );

            if (activity == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró la actividad en este negocio."
                );
            }

            var professor = await _professorRepository.GetOneAsync(
                x =>
                    x.Id == dto.ProfessorId &&
                    x.TenantId == tenantId
            );

            if (professor == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el profesor en este negocio."
                );
            }

            if (!professor.IsActive)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El profesor seleccionado no está activo."
                );
            }

            var hasOverlap = await _classTemplateRepository
                .Query()
                .AnyAsync(x =>
                    x.TenantId == tenantId &&
                    x.Id != id &&
                    x.DayOfWeek == dto.DayOfWeek &&
                    x.StartTime < dto.EndTime &&
                    x.EndTime > dto.StartTime
                );

            if (hasOverlap)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Ya existe una plantilla de clase en ese horario."
                );
            }

            _mapper.Map(dto, classTemplate);

            await _classTemplateRepository.UpdateOneAsync(
                classTemplate
            );

            var updatedTemplate = await _classTemplateRepository
                .Query()
                .Where(x =>
                    x.Id == id &&
                    x.TenantId == tenantId
                )
                .Include(x => x.Activity)
                .Include(x => x.Professor)
                    .ThenInclude(x => x.User)
                .Include(x => x.Students)
                    .ThenInclude(x => x.Student)
                        .ThenInclude(x => x.User)
                .FirstAsync();

            return _mapper.Map<ResponseClassTemplateDTO>(
                updatedTemplate
            );
        }

        public async Task Delete(
            int id)
        {
            await _permissionServices.CheckPermission(
                "CLASS_DELETE"
            );

            var tenantId = _currentTenantService.GetRequiredTenantId();


            var classTemplate = await _classTemplateRepository.GetOneAsync(
                x =>
                    x.Id == id &&
                    x.TenantId == tenantId
            );

            if (classTemplate == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró la plantilla."
                );
            }

            await _classTemplateRepository.DeleteOneAsync(
                classTemplate
            );
        }

        public async Task AddStudent(
            int classTemplateId,
            AddClassTemplateStudentDTO dto)
        {
            await _permissionServices.CheckPermission(
                "CLASS_UPDATE"
            );

            var tenantId = _currentTenantService.GetRequiredTenantId();


            var classTemplate = await _classTemplateRepository
                .GetOneAsync(
                    x =>
                        x.Id == classTemplateId &&
                        x.TenantId == tenantId,
                    x => x.Students
                );

            if (classTemplate == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró la plantilla."
                );
            }

            if (classTemplate.Students.Count >= classTemplate.MaxCapacity)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La plantilla ya alcanzó su capacidad máxima."
                );
            }

            var student = await _studentRepository.GetOneAsync(
                x =>
                    x.Id == dto.StudentId &&
                    x.TenantId == tenantId
            );

            if (student == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró el alumno en este negocio."
                );
            }

            var alreadyExists = classTemplate.Students
                .Any(x => x.StudentId == dto.StudentId);

            if (alreadyExists)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El alumno ya está asignado a esta plantilla."
                );
            }

            var classTemplateStudent = new ClassTemplateStudent
            {
                ClassTemplateId = classTemplateId,
                StudentId = dto.StudentId
            };

            await _classTemplateStudentRepository.CreateOneAsync(
                classTemplateStudent
            );
        }

        public async Task RemoveStudent(
            int classTemplateId,
            int studentId)
        {
            await _permissionServices.CheckPermission(
                "CLASS_UPDATE"
            );

            var tenantId = _currentTenantService.GetRequiredTenantId();


            var classTemplate = await _classTemplateRepository.GetOneAsync(
                x =>
                    x.Id == classTemplateId &&
                    x.TenantId == tenantId
            );

            if (classTemplate == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "No se encontró la plantilla."
                );
            }

            var classTemplateStudent =
                await _classTemplateStudentRepository.GetOneAsync(
                    x =>
                        x.ClassTemplateId == classTemplateId &&
                        x.StudentId == studentId
                );

            if (classTemplateStudent == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "El alumno no está asignado a esta plantilla."
                );
            }

            await _classTemplateStudentRepository.DeleteOneAsync(
                classTemplateStudent
            );
        }

        public async Task<List<ResponseClassDTO>> CopyDay(
    CopyClassTemplateDayDTO dto)
        {
            await _permissionServices.CheckPermission(
                Permissions.CLASS_CREATE
            );

            var tenantId =
                _currentTenantService.GetRequiredTenantId();

            if (
                dto.DestinationDate <
                DateOnly.FromDateTime(TimeHelper.Now())
            )
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No puedes copiar un día a una fecha pasada"
                );
            }

            var classTemplates =
                await _classTemplateRepository
                    .Query()
                    .Where(ct =>
                        ct.TenantId == tenantId &&
                        ct.DayOfWeek == dto.DayOfWeek
                    )
                    .Include(ct => ct.Activity)
                    .Include(ct => ct.Professor)
                        .ThenInclude(p => p.User)
                    .Include(ct => ct.Students)
                        .ThenInclude(cts => cts.Student)
                            .ThenInclude(s => s.User)
                    .ToListAsync();

            if (!classTemplates.Any())
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No hay clases configuradas para ese día en la semana modelo"
                );
            }

            /*
             * Verificar conflictos con clases que
             * ya existen en el calendario.
             */
            var errors = new List<string>();

            foreach (var template in classTemplates)
            {
                var overlappingClass =
                    await _classRepository.GetOneAsync(
                        c =>
                            c.TenantId == tenantId &&
                            c.Date == dto.DestinationDate &&
                            c.StartTime < template.EndTime &&
                            c.EndTime > template.StartTime
                    );

                if (overlappingClass != null)
                {
                    errors.Add(
                        $"Ya existe una clase el {dto.DestinationDate} " +
                        $"entre las {template.StartTime} y " +
                        $"{template.EndTime}."
                    );
                }
            }

            /*
             * Verificar conflictos entre las propias
             * plantillas que se van a copiar.
             */
            for (var i = 0; i < classTemplates.Count; i++)
            {
                for (var j = i + 1; j < classTemplates.Count; j++)
                {
                    var first = classTemplates[i];
                    var second = classTemplates[j];

                    if (
                        first.StartTime < second.EndTime &&
                        first.EndTime > second.StartTime
                    )
                    {
                        errors.Add(
                            $"Hay un conflicto entre clases " +
                            $"el {dto.DestinationDate}."
                        );
                    }
                }
            }

            if (errors.Any())
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    string.Join(" | ", errors)
                );
            }

            /*
             * Crear las entidades Class en memoria.
             * Todavía no se guarda nada.
             */
            var classes = new List<Class>();

            foreach (var template in classTemplates)
            {
                var classEntity =
                    _mapper.Map<Class>(template);

                classEntity.Id = 0;
                classEntity.TenantId = tenantId;
                classEntity.Date = dto.DestinationDate;

                classes.Add(classEntity);
            }

            /*
             * Validar los alumnos de todas las clases.
             */
            for (var i = 0; i < classTemplates.Count; i++)
            {
                var template =
                    classTemplates[i];

                var classEntity =
                    classes[i];

                foreach (var templateStudent in template.Students)
                {
                    var validationError =
                        await _reservationValidationServices
                            .ValidateStudentForClass(
                                templateStudent.Student,
                                classEntity
                            );

                    if (validationError != null)
                    {
                        errors.Add(validationError);
                    }
                }
            }

            if (errors.Any())
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    string.Join(" | ", errors)
                );
            }

            /*
             * Crear todo dentro de una única transacción.
             */
            await using var transaction =
                await _db.Database.BeginTransactionAsync();

            try
            {
                await _db.Classes.AddRangeAsync(classes);

                await _db.SaveChangesAsync();

                /*
                 * Crear las reservas de los alumnos.
                 */
                for (var i = 0; i < classTemplates.Count; i++)
                {
                    var template =
                        classTemplates[i];

                    var classEntity =
                        classes[i];

                    foreach (var templateStudent in template.Students)
                    {
                        classEntity.Reservations.Add(
                            new Reservation
                            {
                                ClassId =
                                    classEntity.Id,

                                TenantId =
                                    tenantId,

                                StudentId =
                                    templateStudent.StudentId,

                                ReservationDate =
                                    DateTime.UtcNow,

                                ReservationStatus =
                                    ReservationStatus.PENDING
                            }
                        );
                    }
                }

                await _db.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            /*
             * Obtener únicamente las clases creadas.
             */
            var createdClassIds =
                classes
                    .Select(c => c.Id)
                    .ToList();

            var createdClasses =
                await _classRepository
                    .Query()
                    .Where(c =>
                        c.TenantId == tenantId &&
                        createdClassIds.Contains(c.Id)
                    )
                    .Include(c => c.Activity)
                    .Include(c => c.Professor)
                        .ThenInclude(p => p.User)
                    .ToListAsync();

            return _mapper.Map<List<ResponseClassDTO>>(
                createdClasses
            );
        }

        public async Task<List<ResponseClassDTO>> CopyWeek(
            CopyClassTemplateWeekDTO dto)
        {
            await _permissionServices.CheckPermission(
                Permissions.CLASS_CREATE
            );

            var tenantId =
                _currentTenantService.GetRequiredTenantId();

            if (
                dto.DestinationMonday.DayOfWeek !=
                DayOfWeek.Monday
            )
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La fecha de destino debe ser un lunes"
                );
            }

            if (
                dto.DestinationMonday <
                DateOnly.FromDateTime(TimeHelper.Now())
            )
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No puedes copiar una semana a una fecha pasada"
                );
            }

            var classTemplates =
                await _classTemplateRepository
                    .Query()
                    .Where(ct => ct.TenantId == tenantId)
                    .Include(ct => ct.Activity)
                    .Include(ct => ct.Professor)
                        .ThenInclude(p => p.User)
                    .Include(ct => ct.Students)
                        .ThenInclude(cts => cts.Student)
                            .ThenInclude(s => s.User)
                    .ToListAsync();

            if (!classTemplates.Any())
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No hay clases en la semana modelo"
                );
            }

            var destinationClasses =
                classTemplates
                    .Select(ct => new
                    {
                        Template = ct,
                        Date = dto.DestinationMonday.AddDays(
                            ((int)ct.DayOfWeek + 6) % 7
                        )
                    })
                    .ToList();

            var errors = new List<string>();

            /*
             * Verificar conflictos con clases que
             * ya existen en el calendario.
             */
            foreach (var item in destinationClasses)
            {
                var overlappingClass =
                    await _classRepository.GetOneAsync(
                        c =>
                            c.TenantId == tenantId &&
                            c.Date == item.Date &&
                            c.StartTime < item.Template.EndTime &&
                            c.EndTime > item.Template.StartTime
                    );

                if (overlappingClass != null)
                {
                    errors.Add(
                        $"Ya existe una clase el {item.Date} " +
                        $"entre las {item.Template.StartTime} y " +
                        $"{item.Template.EndTime}."
                    );
                }
            }

            /*
             * Verificar conflictos entre las propias
             * plantillas que se van a copiar.
             */
            for (var i = 0; i < destinationClasses.Count; i++)
            {
                for (var j = i + 1; j < destinationClasses.Count; j++)
                {
                    var first =
                        destinationClasses[i];

                    var second =
                        destinationClasses[j];

                    if (
                        first.Date == second.Date &&
                        first.Template.StartTime < second.Template.EndTime &&
                        first.Template.EndTime > second.Template.StartTime
                    )
                    {
                        errors.Add(
                            $"Hay un conflicto entre clases " +
                            $"el {first.Date}."
                        );
                    }
                }
            }

            if (errors.Any())
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    string.Join(" | ", errors)
                );
            }

            /*
             * Crear las entidades Class en memoria.
             * Todavía no se guarda nada.
             */
            var classes = new List<Class>();

            foreach (var item in destinationClasses)
            {
                var classEntity =
                    _mapper.Map<Class>(
                        item.Template
                    );

                classEntity.Id = 0;
                classEntity.TenantId = tenantId;
                classEntity.Date = item.Date;

                classes.Add(classEntity);
            }

            /*
             * Validar los alumnos.
             *
             * Primero agrupamos todas las fechas que
             * se van a crear para cada alumno.
             */
            var studentClassDates =
                destinationClasses
                    .SelectMany(item =>
                        item.Template.Students.Select(
                            student => new
                            {
                                StudentId =
                                    student.StudentId,

                                Date = item.Date
                            }
                        )
                    )
                    .GroupBy(x => x.StudentId)
                    .ToDictionary(
                        g => g.Key,
                        g => g
                            .Select(x => x.Date)
                            .ToList()
                    );

            /*
             * Validamos cada alumno de cada clase.
             */
            for (var i = 0; i < destinationClasses.Count; i++)
            {
                var template =
                    destinationClasses[i].Template;

                var classEntity =
                    classes[i];

                foreach (var templateStudent in template.Students)
                {
                    var additionalClassDates =
                        studentClassDates[
                            templateStudent.StudentId
                        ];

                    additionalClassDates =
                        additionalClassDates
                            .Where(date => date != classEntity.Date)
                            .ToList();

                    var validationError =
                        await _reservationValidationServices
                            .ValidateStudentForClass(
                                templateStudent.Student,
                                classEntity,
                                additionalClassDates
                            );

                    if (validationError != null)
                    {
                        errors.Add(validationError);
                    }
                }
            }

            if (errors.Any())
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    string.Join(" | ", errors)
                );
            }

            /*
             * Crear todo dentro de una única transacción.
             */
            await using var transaction =
                await _db.Database.BeginTransactionAsync();

            try
            {
                await _db.Classes.AddRangeAsync(classes);

                await _db.SaveChangesAsync();

                for (var i = 0; i < destinationClasses.Count; i++)
                {
                    var template =
                        destinationClasses[i].Template;

                    var classEntity =
                        classes[i];

                    foreach (var templateStudent in template.Students)
                    {
                        classEntity.Reservations.Add(
                            new Reservation
                            {
                                ClassId =
                                    classEntity.Id,

                                TenantId =
                                    tenantId,

                                StudentId =
                                    templateStudent.StudentId,

                                ReservationDate =
                                    DateTime.UtcNow,

                                ReservationStatus =
                                    ReservationStatus.PENDING
                            }
                        );
                    }
                }

                await _db.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            /*
             * Obtener las clases creadas para devolver
             * los DTOs completos.
             */
            var createdClasses =
                await _classRepository
                    .Query()
                    .Where(c =>
                        c.TenantId == tenantId &&
                        c.Date >= dto.DestinationMonday &&
                        c.Date <=
                            dto.DestinationMonday.AddDays(6)
                    )
                    .Include(c => c.Activity)
                    .Include(c => c.Professor)
                        .ThenInclude(p => p.User)
                    .ToListAsync();

            return _mapper.Map<List<ResponseClassDTO>>(
                createdClasses
            );
        }
    }
}