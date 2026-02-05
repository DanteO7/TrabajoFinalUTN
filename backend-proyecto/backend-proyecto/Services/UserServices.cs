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
        private readonly IStudentRepository _studentRepository;
        private readonly IProfessorRepository _professorRepository;
        private readonly ApplicationDbContext _db;


        public UserServices(IUserRepository repo, IMapper mapper, IEncoderServices encoderServices, IStudentRepository studentRepository, IProfessorRepository professorRepository, ApplicationDbContext db)
        {
            _repo = repo;
            _mapper = mapper;
            _encoderServices = encoderServices;
            _studentRepository = studentRepository;
            _professorRepository = professorRepository;
            _db = db;
        }

        public async Task<List<UserWithoutPassDTO>> GetAll(string? search, bool? isProfessor, bool? isStudent)
        {
            IQueryable<User> query = _repo.Query();

            if (!search.IsNullOrEmpty())
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

        public async Task<UserWithoutPassDTO> UpdateOne(int id, UpdateUserDTO updatedUser)
        {
            var user = await _repo.GetOneAsync(p => p.Id == id);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = {id}");
            }
            _mapper.Map(updatedUser, user);
            await _repo.UpdateOneAsync(user);

            return _mapper.Map<UserWithoutPassDTO>(user);
        }
    }
}
