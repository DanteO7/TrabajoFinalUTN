using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
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

        public async Task<List<PersonWithoutPassDTO>> GetAll()
        {
            var persons = await _repo.GetAllAsync();
            return _mapper.Map<List<PersonWithoutPassDTO>>(persons);
        }

        public async Task<PersonWithoutPassDTO?> GetOneById(int id)
        {
            var person = await _repo.GetOneAsync(p => p.Id == id);
            if (person == null)
            {
                // implementacion de errores
            }
            return person != null ? _mapper.Map<PersonWithoutPassDTO>(person) : null;
        }

        public async Task<PersonWithoutPassDTO> CreateOne(RegisterDTO registerDTO)
        {
            var person = _mapper.Map<Person>(registerDTO);
            person.Password = _encoderServices.Encode(person.Password);
            await _repo.CreateOneAsync(person);
            return _mapper.Map<PersonWithoutPassDTO>(person);
        }

        public async Task DeleteOne(int id)
        {
            var person = await _repo.GetOneAsync(p => p.Id == id);
            if(person == null)
            {
                // implementacion de errores
            }
            await _repo.DeleteOneAsync(person);
        }

        public async Task UpdateOne(int id, UpdatePersonDTO updatedPerson)
        {
            var person = await _repo.GetOneAsync(p => p.Id == id);
            if (person == null)
            {
                // implementacion de errores
            }
            _mapper.Map(updatedPerson, person);
            await _repo.UpdateOneAsync(person);
        }
    }
}
