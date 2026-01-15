using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using System.Net;

namespace backend_proyecto.Services
{
    public class UserServices
    {
        private readonly IuserRepository _repo;
        private readonly IMapper _mapper;
        private readonly IEncoderServices _encoderServices;

        public UserServices(IuserRepository repo, IMapper mapper, IEncoderServices encoderServices)
        {
            _repo = repo;
            _mapper = mapper;
            _encoderServices = encoderServices;
        }

        public async Task<List<UserWithoutPassDTO>> GetAll()
        {
            var users = await _repo.GetAllAsync();
            return _mapper.Map<List<UserWithoutPassDTO>>(users);
        }

        public async Task<UserWithoutPassDTO?> GetOneById(int id)
        {
            var user = await _repo.GetOneAsync(p => p.Id == id);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = {id}");
            }
            return _mapper.Map<UserWithoutPassDTO>(user);
        }

        public async Task<User?> GetOneByEmail(string email)
        {
            var user = await _repo.GetOneAsync(p => p.Email == email);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Email = {email}");
            };
            return user;

        }

        public async Task<UserWithoutPassDTO> CreateOne(RegisterDTO registerDTO)
        {
            var user = _mapper.Map<User>(registerDTO);
            user.Password = _encoderServices.Encode(user.Password);
            await _repo.CreateOneAsync(user);
            return _mapper.Map<UserWithoutPassDTO>(user);
        }

        public async Task DeleteOne(int id)
        {
            var user = await _repo.GetOneAsync(p => p.Id == id);
            if(user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = {id}");
            }
            await _repo.DeleteOneAsync(user);
        }

        public async Task UpdateOne(int id, UpdateUserDTO updatedUser)
        {
            var user = await _repo.GetOneAsync(p => p.Id == id);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = {id}");
            }
            _mapper.Map(updatedUser, user);
            await _repo.UpdateOneAsync(user);
        }
    }
}
