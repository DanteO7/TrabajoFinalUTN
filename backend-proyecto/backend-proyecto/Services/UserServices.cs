using AutoMapper;
using backend_projeto.Models.DTOs;
using backend_proyecto.Config;
using backend_proyecto.Enums;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using Microsoft.Win32;
using System.Net;

namespace backend_proyecto.Services
{
    public class UserServices : IUserServices
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

        public async Task<PagedResponse<UserWithoutPassDTO>> GetAll(
            string? search,
            string? role,
            int page = 1,
            int pageSize = 10)
        {
            IQueryable<User> query = _repo.Query();

            if (!string.IsNullOrEmpty(search))
            {
                var normalized = search.Trim().ToLower();

                query = query.Where(u => u.Name.Trim().ToLower().Contains(normalized) ||
                u.Surname.Trim().ToLower().Contains(normalized) ||
                u.Email.Trim().ToLower().Contains(normalized));
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                switch (role)
                {
                    case Roles.PROFESSOR:
                        query = query.Where(u =>
                            _db.Professors.Any(p => p.UserId == u.Id));
                        break;

                    case Roles.STUDENT:
                        query = query.Where(u =>
                            _db.Students.Any(s => s.UserId == u.Id));
                        break;

                    case Roles.TENANT:
                        query = query.Where(u =>
                            _db.Tenants.Any(t => t.OwnerUserId == u.Id));
                        break;

                    case Roles.ADMIN:
                        query = query.Where(u =>
                            _db.Admin.Any(a => a.UserId == u.Id));
                        break;
                }
            }

            var totalCount = await query.CountAsync();


            var users = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var mapped = _mapper.Map<List<UserWithoutPassDTO>>(users);

            return new PagedResponse<UserWithoutPassDTO>
            {
                Items = mapped,
                Page = page,
                PageSize = pageSize,
                HasNextPage = page * pageSize < totalCount
            };
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

        public async Task<User> CreateOne(RegisterDTO registerDTO)
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
            if (registerDTO.PhoneNumber != null && registerDTO.PhoneNumber.Length > 20)
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
            return user;
        }

        public async Task DeleteOne(int id)
        {
            var user = await _repo.GetOneAsync(u => u.Id == id);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }
            await _repo.DeleteOneAsync(user);
        }

        public async Task<UserWithoutPassDTO> UpdateOne(int id, UpdateUserDTO updatedUser)
        {
            var user = await _repo.GetOneAsync(u => u.Id == id);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }

            if (updatedUser.Name != null && updatedUser.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del usuario no puede tener mas de 50 caracteres");
            }
            if (updatedUser.Surname != null && updatedUser.Surname.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El apellido del usuario no puede tener mas de 50 caracteres");
            }
            if (updatedUser.PhoneNumber != null && updatedUser.PhoneNumber.Length > 20)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El numero de teléfono del usuario no puede tener mas de 20 caracteres");
            }
            if (updatedUser.PhoneNumber != null && updatedUser.Age > 120 || updatedUser.Age < 1)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"La edad tiene que ser entre 1 y 120");
            }
            if (updatedUser.PhoneNumber != null && updatedUser.Weight > 300 || updatedUser.Weight < 1)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El peso tiene que ser entre 1 y 300");
            }

            if (updatedUser.Name != null)
                user.Name = updatedUser.Name;
            if (updatedUser.Surname != null)
                user.Surname = updatedUser.Surname;
            if (updatedUser.PhoneNumber != null)
                user.PhoneNumber = updatedUser.PhoneNumber;
            if (updatedUser.Age != null)
                user.Age = updatedUser.Age;
            if (updatedUser.Weight != null)
                user.Weight = updatedUser.Weight;

            await _repo.UpdateOneAsync(user);

            return _mapper.Map<UserWithoutPassDTO>(user);
        }

        public async Task<UserWithoutPassDTO> ChangeEmail(int id, ChangeEmailDTO changeEmailDTO)
        {
            var user = await _repo.GetOneAsync(u => u.Id == id);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }
            if (changeEmailDTO.NewEmail.Length > 100)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nuevo email no puede tener mas de 100 caracteres");
            }

            var verification = await _db.EmailVerifications
                .Where(v => v.Email == changeEmailDTO.NewEmail)
                .OrderByDescending(v => v.CreatedAt)
                .FirstOrDefaultAsync();

            if (verification == null)
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    $"No existe una verificación para el mail = '{changeEmailDTO.NewEmail}'");

            if (verification.Used)
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    $"El código ya fue utilizado");

            if (verification.ExpiresAt < DateTime.UtcNow)
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    $"El código expiró");

            if (verification.Code != changeEmailDTO.VerificationCode)
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    $"Código incorrecto");

            if (changeEmailDTO.NewEmail != null)
                user.Email = changeEmailDTO.NewEmail;

            await _repo.UpdateOneAsync(user);

            return _mapper.Map<UserWithoutPassDTO>(user);
        }

        public async Task<UserWithoutPassDTO> ChangePassword(ChangePasswordDTO changePasswordDTO)
        {
            var verification = await _db.PasswordResets
                .Where(v => v.Token == changePasswordDTO.Token)
                .OrderByDescending(v => v.CreatedAt)
                .FirstOrDefaultAsync();

            if (verification == null)
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Token inválido"
                );

            if (verification.Used)
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La recuperación ya fue utilizada"
                );

            if (verification.ExpiresAt < DateTime.UtcNow)
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El token expiró"
                );

            var user = await _repo.GetOneAsync(
                u => u.Email == verification.Email
            );

            if (user == null)
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "Usuario no encontrado"
                );

            if (changePasswordDTO.NewPassword.Length < 8)
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La contraseña debe tener mínimo 8 caracteres"
                );

            if (changePasswordDTO.NewPassword != changePasswordDTO.ConfirmNewPassword)
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Las contraseñas no coinciden"
                );

            user.Password = _encoderServices.Encode(
                changePasswordDTO.NewPassword
            );
            verification.Used = true;

            await _repo.UpdateOneAsync(user);
            return _mapper.Map<UserWithoutPassDTO>(user);
        }
    }
}
