using backend_proyecto.Repositories;
using Microsoft.EntityFrameworkCore;

namespace backend_proyecto.Services.Observer
{
    public class WaitlistEmailObserver : IWaitlistObserver
    {
        private readonly IWaitlistRepository _waitlistRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IClassRepository _classRepository;
        private readonly EmailServices _emailServices;

        public WaitlistEmailObserver(
            IWaitlistRepository waitlistRepository,
            IStudentRepository studentRepository,
            IClassRepository classRepository,
            EmailServices emailServices)
        {
            _waitlistRepository = waitlistRepository;
            _studentRepository = studentRepository;
            _classRepository = classRepository;
            _emailServices = emailServices;
        }

        public async Task Update(int classId)
        {
            var classEntity = await _classRepository.GetOneAsync(
                c => c.Id == classId,
                c => c.Tenant
            );

            if (classEntity == null)
                return;

            var waitlist = await _waitlistRepository.Query()
                .Where(w => w.ClassId == classId)
                .OrderBy(w => w.CreatedAt)
                .ToListAsync();

            foreach (var entry in waitlist)
            {
                var student = await _studentRepository.GetOneAsync(
                    s => s.Id == entry.StudentId,
                    s => s.User
                );

                if (student?.User?.Email == null)
                    continue;

                await _emailServices.SendWaitlistAvailableEmail(
                    student.User.Email,
                    classEntity.Tenant.Name,
                    classEntity.Date,
                    classEntity.StartTime
                );
            }
        }
    }
}