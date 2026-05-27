using Microsoft.EntityFrameworkCore;

public static class PermissionSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        var permissions = new List<Permission>
        {
            // TENANT
            new Permission { Id = 1, Name = Permissions.TENANT_READ },
            new Permission { Id = 2, Name = Permissions.TENANT_UPDATE },

            // USERS
            new Permission { Id = 3, Name = Permissions.USER_READ },
            new Permission { Id = 4, Name = Permissions.USER_CREATE },
            new Permission { Id = 5, Name = Permissions.USER_UPDATE },
            new Permission { Id = 6, Name = Permissions.USER_DELETE },

            // STUDENTS
            new Permission { Id = 7, Name = Permissions.STUDENT_READ },
            new Permission { Id = 8, Name = Permissions.STUDENT_CREATE },
            new Permission { Id = 9, Name = Permissions.STUDENT_UPDATE },
            new Permission { Id = 10, Name = Permissions.STUDENT_DELETE },

            // PROFESSORS
            new Permission { Id = 11, Name = Permissions.PROFESSOR_READ },
            new Permission { Id = 12, Name = Permissions.PROFESSOR_CREATE },
            new Permission { Id = 13, Name = Permissions.PROFESSOR_UPDATE },
            new Permission { Id = 14, Name = Permissions.PROFESSOR_DELETE },
            new Permission { Id = 15, Name = Permissions.PROFESSOR_ASSIGN_SPECIALITY },
            new Permission { Id = 16, Name = Permissions.PROFESSOR_REMOVE_SPECIALITY },

            // ACTIVITIES
            new Permission { Id = 17, Name = Permissions.ACTIVITY_READ },
            new Permission { Id = 18, Name = Permissions.ACTIVITY_CREATE },
            new Permission { Id = 19, Name = Permissions.ACTIVITY_UPDATE },
            new Permission { Id = 20, Name = Permissions.ACTIVITY_DELETE },

            // SPECIALITIES
            new Permission { Id = 21, Name = Permissions.SPECIALITY_READ },
            new Permission { Id = 22, Name = Permissions.SPECIALITY_CREATE },
            new Permission { Id = 23, Name = Permissions.SPECIALITY_UPDATE },
            new Permission { Id = 24, Name = Permissions.SPECIALITY_DELETE },

            // CLASSES
            new Permission { Id = 25, Name = Permissions.CLASS_READ },
            new Permission { Id = 26, Name = Permissions.CLASS_CREATE },
            new Permission { Id = 27, Name = Permissions.CLASS_UPDATE },
            new Permission { Id = 28, Name = Permissions.CLASS_DELETE },

            // RESERVATIONS
            new Permission { Id = 29, Name = Permissions.RESERVATION_READ },
            new Permission { Id = 30, Name = Permissions.RESERVATION_CREATE },
            new Permission { Id = 31, Name = Permissions.RESERVATION_DELETE },
            new Permission { Id = 32, Name = Permissions.RESERVATION_CHANGE_STATUS },

            // PAYMENTS
            new Permission { Id = 33, Name = Permissions.PAYMENT_READ },
            new Permission { Id = 34, Name = Permissions.PAYMENT_CREATE },
            new Permission { Id = 35, Name = Permissions.PAYMENT_UPDATE },
            new Permission { Id = 36, Name = Permissions.PAYMENT_DELETE },

            // STUDENT PLAN
            new Permission { Id = 37, Name = Permissions.STUDENT_PLAN_READ },
            new Permission { Id = 38, Name = Permissions.STUDENT_PLAN_CREATE },
            new Permission { Id = 39, Name = Permissions.STUDENT_PLAN_UPDATE },
            new Permission { Id = 40, Name = Permissions.STUDENT_PLAN_DELETE },

            // TENANT PLAN
            new Permission { Id = 41, Name = Permissions.TENANT_PLAN_READ },
            new Permission { Id = 42, Name = Permissions.TENANT_PLAN_CREATE },
            new Permission { Id = 43, Name = Permissions.TENANT_PLAN_UPDATE },
            new Permission { Id = 44, Name = Permissions.TENANT_PLAN_DELETE },

            // GROUPS
            new Permission { Id = 45, Name = Permissions.GROUP_READ },
            new Permission { Id = 46, Name = Permissions.GROUP_CREATE },
            new Permission { Id = 47, Name = Permissions.GROUP_UPDATE },
            new Permission { Id = 48, Name = Permissions.GROUP_DELETE },
            new Permission { Id = 49, Name = Permissions.GROUP_ASSIGN_USER },
            new Permission { Id = 50, Name = Permissions.GROUP_REMOVE_USER },
            new Permission { Id = 51, Name = Permissions.GROUP_ASSIGN_PERMISSION }
        };

        modelBuilder.Entity<Permission>().HasData(permissions);
    }
}