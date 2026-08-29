using AutoMapper;
using backend_proyecto.Models;
using backend_proyecto.Models.DTOs;
using backend_proyecto.Repositories;
using backend_proyecto.Utils.Errors;
using Humanizer;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Net;


namespace backend_proyecto.Services
{
    public class NewsServices
    {
        private readonly INewsRepository _newsRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IMapper _mapper;
        private readonly IUserRepository _userRepository;
        private readonly IAdminRepository _adminRepository;
        private readonly PermissionServices _permissionServices;

        public NewsServices(
            INewsRepository newsRepository,ITenantRepository tenantRepository,IMapper mapper, IUserRepository userRepository, IAdminRepository adminRepository, PermissionServices permissionServices)
        {
            _newsRepository = newsRepository;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
            _userRepository = userRepository;
            _adminRepository = adminRepository;
            _permissionServices = permissionServices;
        }

        public async Task<ResponseNewsDTO> CreateOne(CreateNewsDTO dto, int userId)
        {
            await _permissionServices.CheckPermission(Permissions.NEWS_CREATE);

            var user = await _userRepository.GetOneAsync(u => u.Id == userId);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    "No se encontro el usuario");
            }

            if (dto.TenantId.HasValue)
            {
                var tenant = await _tenantRepository.GetOneAsync(t => t.Id == dto.TenantId);
                if (tenant == null || tenant.OwnerUserId != userId)
                {
                    throw new HttpResponseError(HttpStatusCode.Forbidden,
                        "No tienes permisos para crear novedades en este negocio");
                }
            }

            if(dto.Title.Length < 1 || dto.Title.Length > 100)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "El título tiene que tener entre 1 a 100 caracteres");
            }

            if (dto.Content.Length < 1 || dto.Content.Length > 2000)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest,
                    "El contenido tiene que tener entre 1 a 2000 caracteres");
            }

            var New = new News
            {
                Title = dto.Title,
                Content = dto.Content,
                TenantId = dto.TenantId,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            await _newsRepository.CreateOneAsync(New);
            return _mapper.Map<ResponseNewsDTO>(New);
        }

        public async Task<ResponseNewsDTO> UpdateOne(int newsId, UpdateNewsDTO dto, int userId)
        {
            await _permissionServices.CheckPermission(Permissions.NEWS_UPDATE);

            var news = await _newsRepository.GetOneAsync(n => n.Id == newsId);
            if (news == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    "No se encontro la novedad");
            }

            var user = await _userRepository.GetOneAsync(u => u.Id == userId);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    "No se encontro el usuario");
            }

            if (dto.TenantId.HasValue)
            {
                var tenant = await _tenantRepository.GetOneAsync(t => t.Id == dto.TenantId);
                if (tenant == null || tenant.OwnerUserId != userId)
                {
                    throw new HttpResponseError(HttpStatusCode.Forbidden,
                        "No tienes permisos para crear novedades en este negocio");
                }
            }
            else
            {
                var isAdmin = await _adminRepository.ExistsByUserId(userId);
                if (!isAdmin)
                {
                    throw new HttpResponseError(HttpStatusCode.Forbidden,
                        "No puedes actualizar una noticia global");
                }
            }

            if(dto.Title != null)
            {
                if (dto.Title.Length < 1 || dto.Title.Length > 100)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest,
                        "El título tiene que tener entre 1 a 100 caracteres");
                }
            }

            if (dto.Content != null)
            {
                if (dto.Content.Length < 1 || dto.Content.Length > 2000)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest,
                        "El contenido tiene que tener entre 1 a 2000 caracteres");
                }
            }

            _mapper.Map(dto, news);

            await _newsRepository.UpdateOneAsync(news);
            return _mapper.Map<ResponseNewsDTO>(news);
        }

        public async Task<List<ResponseNewsDTO>> GetNews(int? tenantId, int userId)
        {
            await _permissionServices.CheckPermission(Permissions.NEWS_READ);

            var user = await _userRepository.GetOneAsync(u => u.Id == userId);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    "No se encontro el usuario");
            }

            IQueryable<News> query = _newsRepository.Query()
                .Include(n => n.CreatedByUser)
                .Include(n => n.Reads);

            if (tenantId.HasValue)
            {
                var tenant = await _tenantRepository.GetOneAsync(t => t.Id == tenantId, t => t.Students, t => t.Professors);
                if(tenant == null)
                {
                    throw new HttpResponseError(HttpStatusCode.NotFound,
                        "No se encontro el negocio");
                }
                var hasAccess =
                   tenant.OwnerUserId == userId ||
                   tenant.Professors.Any(p => p.UserId == userId) ||
                   tenant.Students.Any(s => s.UserId == userId);

                if (!hasAccess)
                {
                    throw new HttpResponseError(HttpStatusCode.Forbidden, "No tenés acceso a este tenant");
                }

                query = query.Where(n => n.TenantId == null || n.TenantId == tenantId);
            }
            else
            {
                query = query.Where(n => n.TenantId == null);
            }

            var News = await query
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return News.Select(n => new ResponseNewsDTO
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                TenantId = n.TenantId,
                CreatedByUser = _mapper.Map<UserWithoutPassDTO>(n.CreatedByUser),
                CreatedAt = n.CreatedAt,
                IsRead = n.Reads.Any(r => r.UserId == userId)
            }).ToList();
        }

        public async Task<int> GetUnreadCount(int? tenantId, int userId)
        {
            await _permissionServices.CheckPermission(Permissions.NEWS_READ);

            var user = await _userRepository.GetOneAsync(u => u.Id == userId);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    "No se encontro el usuario");
            }

            IQueryable<News> query = _newsRepository.Query()
                .Include(n => n.Reads);

            if (tenantId.HasValue)
            {
                var tenant = await _tenantRepository.GetOneAsync(t => t.Id == tenantId, t => t.Students, t => t.Professors);
                if (tenant == null)
                {
                    throw new HttpResponseError(HttpStatusCode.NotFound,
                        "No se encontro el negocio");
                }
                var hasAccess =
                   tenant.OwnerUserId == userId ||
                   tenant.Professors.Any(p => p.UserId == userId) ||
                   tenant.Students.Any(s => s.UserId == userId);

                if (!hasAccess)
                {
                    throw new HttpResponseError(HttpStatusCode.Forbidden, "No tenés acceso a este tenant");
                }

                query = query.Where(n => n.TenantId == null || n.TenantId == tenantId);
            }
            else
            {
                query = query.Where(n => n.TenantId == null);
            }

            var Newses = await query.ToListAsync();

            return Newses.Count(n => !n.Reads.Any(r => r.UserId == userId));
        }

        public async Task MarkAsRead(int NewsId, int userId)
        {
            await _permissionServices.CheckPermission(Permissions.NEWS_READ);

            var News = await _newsRepository.GetOneAsync(n => n.Id == NewsId);
            if (News == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    "Novedad no encontrada");
            }

            var alreadyRead = News.Reads.Any(r => r.UserId == userId);
            if (!alreadyRead)
            {
                var read = new NewsRead
                {
                    NewsId = NewsId,
                    UserId = userId,
                    ReadAt = DateTime.UtcNow
                };
                News.Reads.Add(read);
                await _newsRepository.UpdateOneAsync(News);
            }
        }

        public async Task DeleteOne(int newsId, int tenantId, int userId)
        {
            await _permissionServices.CheckPermission(Permissions.NEWS_DELETE);

            var news = await _newsRepository.GetOneAsync(n => n.Id == newsId);
            if (news == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound,
                    "No se encontro la novedad");
            }

            if (tenantId > 0)
            {
                if (news.TenantId != tenantId)
                {
                    throw new HttpResponseError(HttpStatusCode.Forbidden,
                        "Esta noticia no pertenece a tu negocio");
                }

                var tenant = await _tenantRepository.GetOneAsync(t => t.Id == tenantId);
                if (tenant == null || tenant.OwnerUserId != userId)
                {
                    throw new HttpResponseError(HttpStatusCode.Forbidden,
                        "No tienes permisos para eliminar novedades en este negocio");
                }
            }
            else
            {
                var isAdmin = await _adminRepository.ExistsByUserId(userId);
                if (!isAdmin)
                {
                    throw new HttpResponseError(HttpStatusCode.Forbidden,
                        "No puedes actualizar una noticia global");
                }
            }

            await _newsRepository.DeleteOneAsync(news);
        }
    }
}
