using backend_proyecto.Config;
using backend_proyecto.Models;
using backend_proyecto.Utils.Errors;
using Humanizer;
using Resend;
using System.Security.Cryptography;

namespace backend_proyecto.Services
{
    public class EmailServices
    {
        private readonly IResend _resend;
        private readonly ApplicationDbContext _context;

        public EmailServices(IResend resend, ApplicationDbContext context)
        {
            _resend = resend;
            _context = context;
        }

        public async Task SendVerificationEmail(string to, string code)
        {
            var message = new EmailMessage();

            message.From = "turnos@turnofacilapp.com.ar";
            message.To.Add(to);
            message.Subject = "Código de verificación";
            message.HtmlBody = $"<h1>Tu código es: {code}</h1>";

            await _resend.EmailSendAsync(message);
        }
        public async Task ForgotPassword(string to)
        {
            var lastReset = _context.PasswordResets
                .Where(pr => pr.Email == to && !pr.Used)
                .OrderByDescending(pr => pr.CreatedAt)
                .FirstOrDefault();

            if (lastReset != null)
            {
                var secondsPassed = (DateTime.UtcNow - lastReset.CreatedAt).TotalSeconds;

                if (secondsPassed < 60)
                {
                    var remaining = 60 - (int)secondsPassed;
                    throw new CooldownException(remaining);
                }

                _context.PasswordResets.Remove(lastReset);
            }

            var oldPasswordResets = _context.PasswordResets
                .Where(pr => pr.Email == to);

            _context.PasswordResets.RemoveRange(oldPasswordResets);

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');
            var passwordReset = new PasswordReset
            {
                Email = to,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(10),
                Used = false,
            };
            _context.PasswordResets.Add(passwordReset);
            await _context.SaveChangesAsync();

            var message = new EmailMessage();

            message.From = "turnos@turnofacilapp.com.ar";
            message.To.Add(to);
            message.Subject = "Recuperación de contraseña";
            message.HtmlBody = $@"
                <a href=""http://turnofacilapp.com.ar/resetear-contraseña?token={Uri.EscapeDataString(token)}"">
                    Restablecer contraseña
                </a>";

            await _resend.EmailSendAsync(message);
        }
        public async Task SendWaitlistAvailableEmail(
            string to,
            string tenantName,
            DateOnly date,
            TimeOnly startTime)
        {
            var message = new EmailMessage();

            message.From = "turnos@turnofacilapp.com.ar";
            message.To.Add(to);

            message.Subject = "¡Se liberó un lugar en una clase!";

            message.HtmlBody = $@"
                <h2>¡Hay un lugar disponible!</h2>

                <p>
                    Se liberó un lugar en <strong>{tenantName}</strong>.
                </p>

                <p>
                    Fecha: {date:dd/MM/yyyy}<br>
                    Horario: {startTime:HH\:mm}
                </p>

                <p>
                    Ingresá a Turno Fácil para reservar tu lugar.
                </p>
            ";

            await _resend.EmailSendAsync(message);
        }
    }
}