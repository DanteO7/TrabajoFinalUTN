using AutoMapper;
using backend_proyecto.Config;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Linq.Expressions;
using System.Net;

namespace backend_proyecto.Services
{
    public class UserServices
    {
        private readonly IUserRepository _repo;
        private readonly IMapper _mapper;
        private readonly IEncoderServices _encoderServices;
        private readonly ApplicationDbContext _db;


        public UserServices(IUserRepository repo, IMapper mapper, IEncoderServices encoderServices, ApplicationDbContext db)
        {
            _repo = repo;
            _mapper = mapper;
            _encoderServices = encoderServices;
            _db = db;
        }

        public async Task<List<UserWithoutPassDTO>> GetAll(string? search, bool? isProfessor, bool? isStudent)
        {
            IQueryable<User> query = _repo.Query();

            if (!string.IsNullOrEmpty(search))
            {
                var normalized = search.Trim().ToLower();

                query = query.Where(u => u.Name.Trim().ToLower().Contains(normalized) || 
                u.Surname.Trim().ToLower().Contains(normalized) || 
                u.Email.Trim().ToLower().Contains(normalized));
            }

            if (isProfessor == true)
            {
                query = query.Where(u => _db.Professors.Any(p => p.UserId == u.Id));
            }
            if (isStudent == true)
            {
                query = query.Where(u => _db.Students.Any(s => s.UserId == u.Id));
            }

            var users = await query.ToListAsync();
            return _mapper.Map<List<UserWithoutPassDTO>>(users);
        }

        public async Task<UserWithoutPassDTO?> GetOneById(int id)
        {
            var user = await _repo.GetOneAsync(u => u.Id == id);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }
            return _mapper.Map<UserWithoutPassDTO>(user);
        }

        public async Task<User?> GetOneByEmail(string email)
        {
            var user = await _repo.GetOneAsync(u => u.Email == email);
            return user;
        }

        public async Task<UserWithoutPassDTO> CreateOne(RegisterDTO registerDTO)
        {
            if (registerDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del usuario no puede tener mas de 50 caracteres");
            }
            if (registerDTO.Surname.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El apellido del usuario no puede tener mas de 50 caracteres");
            }
            if (registerDTO.Email.Length > 100)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El email del usuario no puede tener mas de 100 caracteres");
            }
            if (registerDTO.PhoneNumber.Length > 20)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El numero de teléfono del usuario no puede tener mas de 20 caracteres");
            }
            if (registerDTO.Password.Length < 8 || registerDTO.Password.Length > 255)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"La contraseña del usuario tiene que tener entre 8 y 255 caracteres");
            }
            if (registerDTO.ConfirmPassword.Length < 8 || registerDTO.ConfirmPassword.Length > 255)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"La confirmación de la contraseña del usuario tiene que tener entre 8 y 255 caracteres");
            }

            var user = _mapper.Map<User>(registerDTO);
            user.Password = _encoderServices.Encode(user.Password);
            await _repo.CreateOneAsync(user);
            return _mapper.Map<UserWithoutPassDTO>(user);
        }

        public async Task DeleteOne(int id)
        {
            var user = await _repo.GetOneAsync(u => u.Id == id);
            if(user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }
            await _repo.DeleteOneAsync(user);
        }

        public async Task<UserWithoutPassDTO> UpdateOne(int id, UpdateUserDTO updatedUser)
        {
            if (updatedUser.Name != null && updatedUser.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del usuario no puede tener mas de 50 caracteres");
            }
            if (updatedUser.Surname != null &&  updatedUser.Surname.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El apellido del usuario no puede tener mas de 50 caracteres");
            }
            var user = await _repo.GetOneAsync(u => u.Id == id);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }
            _mapper.Map(updatedUser, user);
            await _repo.UpdateOneAsync(user);

            return _mapper.Map<UserWithoutPassDTO>(user);
        }
    }
}
