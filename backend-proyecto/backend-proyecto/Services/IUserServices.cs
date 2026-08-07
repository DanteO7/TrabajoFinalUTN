using backend_projeto.Models.DTOs;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;

namespace backend_proyecto.Services
{
    public interface IUserServices
    {
        Task<PagedResponse<UserWithoutPassDTO>> GetAll(
            string? search,
            string? role,
            int page = 1,
            int pageSize = 10);
        Task<UserWithoutPassDTO?> GetOneById(int id);
        Task<User?> GetOneByEmail(string email);
        Task<User> CreateOne(RegisterDTO registerDTO);
        Task DeleteOne(int id);
        Task<UserWithoutPassDTO> UpdateOne(int id, UpdateUserDTO updatedUser);
        Task<UserWithoutPassDTO> ChangeEmail(int id, ChangeEmailDTO changeEmailDTO);
        Task<UserWithoutPassDTO> ChangePassword(ChangePasswordDTO changePasswordDTO);
    }
}