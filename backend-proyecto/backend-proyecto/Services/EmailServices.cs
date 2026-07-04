using backend_proyecto.Config;
using backend_proyecto.Models;
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

            message.From = "onboarding@resend.dev";
            message.To.Add(to);
            message.Subject = "Código de verificación";
            message.HtmlBody = $"<h1>Tu código es: {code}</h1>";

            await _resend.EmailSendAsync(message);
        }
        public async Task ForgotPassword(string to)
        {
            var oldPasswordResets = _context.PasswordResets
                .Where(pr => pr.Email == to && !pr.Used);

            _context.PasswordResets.RemoveRange(oldPasswordResets);

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');
            var passwordReset = new PasswordReset
            {
                Id = 1,
                Email = to,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(10),
                Used = false,
            };
            _context.PasswordResets.Add(passwordReset);
            await _context.SaveChangesAsync();

            Console.WriteLine(token);
            var message = new EmailMessage();

            message.From = "onboarding@resend.dev";
            message.To.Add(to);
            message.Subject = "Recuperación de contraseña";
            message.HtmlBody = $@"
                <a href=""http://localhost:5173/reset-password?token={Uri.EscapeDataString(token)}"">
                    Restablecer contraseña
                </a>";

            await _resend.EmailSendAsync(message);
        }
    }
}