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
        public async Task SendTenantRequestEmail(
            string userEmail,
            string userName,
            string tenantName,
            string planName,
            IFormFile comprobante,
            string token)
        {
            using var memoryStream = new MemoryStream();

            await comprobante.CopyToAsync(memoryStream);

            var message = new EmailMessage();

            message.From = "turnos@turnofacilapp.com.ar";
            message.To.Add("dante.orsetti@gmail.com");

            message.Subject =
                $"Solicitud de nuevo negocio - {tenantName}";

            var reviewUrl = $"https://turnofacilapp.com.ar/crear-negocio?token={Uri.EscapeDataString(token)}";

            message.HtmlBody = $@"
                <h2>Nueva solicitud de negocio</h2>

                <p>
                    <strong>Usuario:</strong> {userName}
                </p>

                <p>
                    <strong>Email:</strong> {userEmail}
                </p>

                <p>
                    <strong>Negocio:</strong> {tenantName}
                </p>

                <p>
                    <strong>Plan:</strong> {planName}
                </p>

                <p>
                    Se adjunta el comprobante de pago enviado por el usuario.
                </p>

                <p>
                    Si el comprobante es correcto, podés crear el negocio
                    desde el siguiente enlace:
                </p>

                <p>
                    <a
                        href=""{reviewUrl}""
                        style=""
                            display:inline-block;
                            padding:12px 20px;
                            background-color:#000;
                            color:#fff;
                            text-decoration:none;
                            border-radius:6px;
                        ""
                    >
                        Crear negocio
                    </a>
                </p>
            ";

            message.Attachments ??= new List<EmailAttachment>();

            message.Attachments.Add(new EmailAttachment
            {
                Filename = comprobante.FileName,
                Content = memoryStream.ToArray(),
                ContentType = comprobante.ContentType
            });

            await _resend.EmailSendAsync(message);
        }

        public async Task SendTenantCreatedEmail(
            string to,
            string tenantName)
        {
            var safeTenantName = System.Net.WebUtility.HtmlEncode(tenantName);

            var message = new EmailMessage();

            message.From = "turnos@turnofacilapp.com.ar";
            message.To.Add(to);
            message.Subject = "¡Tu negocio ya está listo en Turno Fácil!";

            message.HtmlBody = $@"
                <div style=""font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;"">
                    <h2>¡Tu negocio ya está creado!</h2>

                    <p>
                        Te informamos que <strong>{safeTenantName}</strong>
                        ya está creado y listo para usar en Turno Fácil.
                    </p>

                    <p>
                        Ya podés ingresar a la plataforma y comenzar a
                        administrar tu negocio, tus clases y tus alumnos.
                    </p>

                    <p>
                        <a
                            href=""https://turnofacilapp.com.ar/""
                            style=""
                                display: inline-block;
                                padding: 12px 20px;
                                background-color: #000;
                                color: #fff;
                                text-decoration: none;
                                border-radius: 6px;
                            ""
                        >
                            Ingresar a Turno Fácil
                        </a>
                    </p>

                    <p>
                        ¡Gracias por confiar en nosotros!
                    </p>
                </div>
            ";

            await _resend.EmailSendAsync(message);
        }
    }
}