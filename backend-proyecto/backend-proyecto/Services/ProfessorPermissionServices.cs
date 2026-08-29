using backend_proyecto.Config;
using backend_proyecto.Models;
using backend_proyecto.Utils.Errors;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace backend_proyecto.Services
{
    public class ProfessorPermissionServices
    {
        private readonly ApplicationDbContext _context;

        public ProfessorPermissionServices(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SetPermission(
            int professorId,
            string permissionName,
            bool isAllowed)
        {
            var professor = await _context.Professors
                .FirstOrDefaultAsync(p =>
                    p.Id == professorId
                );

            if (professor == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "Profesor no encontrado"
                );
            }

            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p =>
                    p.Name == permissionName
                );

            if (permission == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"Permiso '{permissionName}' no existe"
                );
            }

            var existing = await _context.ProfessorPermissions
                .FirstOrDefaultAsync(pp =>
                    pp.ProfessorId == professorId &&
                    pp.PermissionId == permission.Id
                );

            if (existing == null)
            {
                _context.ProfessorPermissions.Add(
                    new ProfessorPermission
                    {
                        ProfessorId = professorId,
                        PermissionId = permission.Id,
                        IsAllowed = isAllowed
                    }
                );
            }
            else
            {
                existing.IsAllowed = isAllowed;
            }

            await _context.SaveChangesAsync();
        }

        public async Task RemoveOverride(
            int professorId,
            string permissionName)
        {
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p =>
                    p.Name == permissionName
                );

            if (permission == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "Permiso no encontrado"
                );
            }

            var overridePermission =
                await _context.ProfessorPermissions
                    .FirstOrDefaultAsync(pp =>
                        pp.ProfessorId == professorId &&
                        pp.PermissionId == permission.Id
                    );

            if (overridePermission == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    "El profesor no tiene un permiso personalizado"
                );
            }

            _context.ProfessorPermissions.Remove(
                overridePermission
            );

            await _context.SaveChangesAsync();
        }
    }
}