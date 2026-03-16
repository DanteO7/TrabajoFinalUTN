using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;

namespace backend_proyecto.Config
{
    public class Mapping : Profile
    {
        public Mapping()
        {
            // Defaults
            CreateMap<int?, int>().ConvertUsing((src, dest) => src ?? dest);
            CreateMap<bool?, bool>().ConvertUsing((src, dest) => src ?? dest);
            CreateMap<string?, string>().ConvertUsing((src, dest) => src ?? dest);
            CreateMap<decimal?, decimal>().ConvertUsing((src, dest) => src ?? dest);
            CreateMap<DateTime?, DateTime>().ConvertUsing((src, dest) => src ?? dest);
            CreateMap<TimeOnly?, TimeOnly>().ConvertUsing((src, dest) => src ?? dest);

            // user
            CreateMap<User, UserWithoutPassDTO>();
            CreateMap<RegisterDTO, User>();
            CreateMap<UpdateUserDTO, User>();

            // tenantPlan
            CreateMap<CreateTenantPlanDTO, TenantPlan>();
            CreateMap<UpdateTenantPlanDTO, TenantPlan>();
            CreateMap<TenantPlan, ResponseTenantPlanDTO>();

            // studentPlan
            CreateMap<CreateStudentPlanDTO, StudentPlan>();
            CreateMap<UpdateStudentPlanDTO, StudentPlan>();
            CreateMap<StudentPlan, ResponseStudentPlanDTO>();

            // student
            CreateMap<AssignStudentDTO, Student>();
            CreateMap<Student, ResponseStudentDTO>();

            // professor
            CreateMap<AssignProfessorDTO, Professor>();
            CreateMap<Professor, ResponseProfessorDTO>()
                .ForMember(dest => dest.Specialities, opt => opt.MapFrom(src => src.ProfessorSpecialities));

            // speciality
            CreateMap<CreateSpecialityDTO, Speciality>();
            CreateMap<UpdateSpecialityDTO, Speciality>();
            CreateMap<Speciality, ResponseSpecialityDTO>();

            // activity
            CreateMap<CreateActivityDTO, Activity>();
            CreateMap<UpdateActivityDTO, Activity>();
            CreateMap<Activity, ResponseActivityDTO>();

            // payment
            CreateMap<CreatePaymentDTO, Payment>();
            CreateMap<UpdateActivityDTO, Payment>();
            CreateMap<Payment, ResponsePaymentDTO>();

            // class
            CreateMap<CreateClassDTO, Class>();
            CreateMap<UpdateClassDTO, Class>();
            CreateMap<Class, ResponseClassDTO>()
                .ForMember(dest => dest.ReservationsCount,
                    opt => opt.MapFrom(src => src.Reservations.Count()))
                .ForMember(dest => dest.AvailableSpots,
                    opt => opt.MapFrom(src => src.MaxCapacity - src.Reservations.Count()));

            // reservation
            CreateMap<CreateReservationDTO, Reservation>();
            CreateMap<Reservation, ResponseReservationDTO>();

            // tenant
            CreateMap<Tenant, ResponseTenantDTO>();

            // professorSpeciality
            CreateMap<ProfessorSpeciality, ResponseProfessorSpecialityDTO>()
                .ForMember(dest => dest.SpecialityId, opt => opt.MapFrom(src => src.SpecialityId))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Speciality.Name));
        }
    }
}
