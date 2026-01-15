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

            // user
            CreateMap<User, UserWithoutPassDTO>();
            CreateMap<RegisterDTO, User>();
            CreateMap<UpdateUserDTO, User>();
        }
    }
}
