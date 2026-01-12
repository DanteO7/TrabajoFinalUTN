using AutoMapper;
using backend_proyecto.Repositories;

namespace backend_proyecto.Services
{
    public class PersonServices
    {
        private readonly IPersonRepository _repo;
        private readonly IMapper _mapper;
        private readonly IEncoderServices _encoderServices;

        public PersonServices(IPersonRepository repo, IMapper mapper, IEncoderServices encoderServices)
        {
            _repo = repo;
            _mapper = mapper;
            _encoderServices = encoderServices;
        }
    }
}
