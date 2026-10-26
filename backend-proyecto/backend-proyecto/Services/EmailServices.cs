using backend_proyecto.Config;
using backend_proyecto.Models;
using backend_proyecto.Utils.Errors;
using Resend;
using System.Net;
using System.Security.Cryptography;

namespace backend_proyecto.Services
{
    public class EmailServices
    {
        private readonly IResend _resend;
        private readonly ApplicationDbContext _context;

        private const string BrandColor = "#fc697b";
        private const string SiteUrl = "https://turnofacilapp.com.ar";

        public EmailServices(IResend resend, ApplicationDbContext context)
        {
            _resend = resend;
            _context = context;
        }

        private static string EmailLayout(string title, string content)
        {
            var safeTitle = WebUtility.HtmlEncode(title);

            return $@"
                <!DOCTYPE html>
                <html lang=""es"">
                <head>
                    <meta charset=""UTF-8"">
                    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                    <meta name=""color-scheme"" content=""light"">
                </head>
                <body style=""
                    margin:0;
                    padding:0;
                    background-color:#EDE9EE;
                    font-family:Arial,Helvetica,sans-serif;
                    color:#29252b;
                "">
                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0""
                        style=""background-color:#EDE9EE;padding:32px 12px;"">
                        <tr>
                            <td align=""center"">
                                <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0""
                                    style=""max-width:560px;background-color:#F1EEF3;border:1px solid #99A1AF;border-radius:16px;overflow:hidden;"">

                                    <tr>
                                        <td style=""height:6px;background-color:{BrandColor};font-size:0;line-height:0;"">
                                            &nbsp;
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style=""padding:30px 24px 20px;text-align:center; "">
                                            <img
                                                src=""{SiteUrl}/logo.png""
                                                alt=""TurnoFácil""
                                                width=""180""
                                                style=""
                                                    display:block;
                                                    width:180px;
                                                    max-width:100%;
                                                    height:auto;
                                                    margin:0 auto;
                                                    border:0;
                                                    outline:none;
                                                    text-decoration:none;
                                                ""
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style=""padding:16px 32px 32px;"">
                                            <h1 style=""
                                                margin:0 0 20px;
                                                font-size:25px;
                                                line-height:1.3;
                                                font-weight:700;
                                                color:#29252b;
                                            "">
                                                {safeTitle}
                                            </h1>

                                            {content}
                                        </td>
                                    </tr>
                                </table>

                                <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0""
                                    style=""max-width:560px;"">
                                    <tr>
                                        <td style=""
                                            padding:22px 16px 0;
                                            text-align:center;
                                            color:#8a8389;
                                            font-size:12px;
                                            line-height:1.7;
                                        "">
                                            TurnoFácil · Organizá tu espacio, tus clases y tus alumnos.
                                            <br>
                                            Este correo fue enviado automáticamente.
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>";
        }

        private static string EmailButton(string url, string text)
        {
            return $@"
                <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""margin:28px 0;"">
                    <tr>
                        <td align=""center"" bgcolor=""{BrandColor}"" style=""border-radius:9px;"">
                            <a href=""{url}""
                                style=""
                                    display:inline-block;
                                    padding:14px 24px;
                                    font-family:Arial,Helvetica,sans-serif;
                                    font-size:15px;
                                    font-weight:bold;
                                    color:#ffffff;
                                    text-decoration:none;
                                    border-radius:9px;
                                "">
                                {WebUtility.HtmlEncode(text)}
                            </a>
                        </td>
                    </tr>
                </table>";
        }

        private static string EmailParagraph(string text)
        {
            return $@"
                <p style=""
                    margin:0 0 16px;
                    font-size:15px;
                    line-height:1.8;
                    color:#625b63;
                "">
                    {text}
                </p>";
        }

        public async Task SendVerificationEmail(string to, string code)
        {
            var safeCode = WebUtility.HtmlEncode(code);

            var content = $@"
                {EmailParagraph("Usá el siguiente código para verificar tu dirección de correo electrónico.")}

                <div style=""
                    margin:24px 0;
                    padding:22px 16px;
                    background-color:#fff4f5;
                    border:1px solid #ffe0e4;
                    border-radius:12px;
                    text-align:center;
                "">
                    <p style=""margin:0 0 8px;font-size:12px;color:#857780;"">
                        TU CÓDIGO DE VERIFICACIÓN
                    </p>
                    <p style=""
                        margin:0;
                        color:{BrandColor};
                        font-size:32px;
                        font-weight:bold;
                        letter-spacing:7px;
                    "">
                        {safeCode}
                    </p>
                </div>

                {EmailParagraph("Si no solicitaste esta verificación, podés ignorar este correo.")}";

            var message = new EmailMessage
            {
                From = "turnos@turnofacilapp.com.ar",
                Subject = "Código de verificación",
                HtmlBody = EmailLayout("Verificá tu correo", content)
            };

            message.To.Add(to);

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

            var resetUrl = $"{SiteUrl}/resetear-contraseña?token={Uri.EscapeDataString(token)}";

            var content = $@"
                {EmailParagraph("Recibimos una solicitud para restablecer la contraseña de tu cuenta.")}

                {EmailParagraph("Para elegir una nueva contraseña, utilizá el siguiente botón. El enlace tiene una validez de 10 minutos.")}

                {EmailButton(resetUrl, "Restablecer contraseña")}

                <div style=""
                    padding:14px 16px;
                    background-color:#F1EEF3;
                    border-radius:9px;
                    margin-top:20px;
                "">
                    <p style=""margin:0;font-size:13px;line-height:1.7;color:#777078;"">
                        Si no solicitaste este cambio, ignorá este correo. Tu contraseña actual seguirá siendo la misma.
                    </p>
                </div>";

            var message = new EmailMessage
            {
                From = "turnos@turnofacilapp.com.ar",
                Subject = "Recuperación de contraseña",
                HtmlBody = EmailLayout("Restablecé tu contraseña", content)
            };

            message.To.Add(to);

            await _resend.EmailSendAsync(message);
        }

        public async Task SendWaitlistAvailableEmail(
            string to,
            string tenantName,
            DateOnly date,
            TimeOnly startTime)
        {
            var safeTenantName = WebUtility.HtmlEncode(tenantName);

            var content = $@"
                {EmailParagraph("¡Se liberó un lugar y ahora tenés la oportunidad de reservarlo!")}

                <div style=""
                    margin:24px 0;
                    padding:20px;
                    background-color:#fff4f5;
                    border:1px solid #ffe0e4;
                    border-radius:12px;
                "">
                    <p style=""margin:0 0 8px;font-size:12px;color:#857780;"">
                        NEGOCIO
                    </p>
                    <p style=""margin:0 0 18px;font-size:18px;font-weight:bold;color:#29252b;"">
                        {safeTenantName}
                    </p>

                    <p style=""margin:0 0 6px;font-size:13px;color:#857780;"">
                        FECHA
                    </p>
                    <p style=""margin:0 0 16px;font-size:16px;font-weight:bold;color:#29252b;"">
                        {date:dd/MM/yyyy}
                    </p>

                    <p style=""margin:0 0 6px;font-size:13px;color:#857780;"">
                        HORARIO
                    </p>
                    <p style=""margin:0;font-size:16px;font-weight:bold;color:#29252b;"">
                        {startTime:HH\:mm}
                    </p>
                </div>

                {EmailParagraph("Ingresá a TurnoFácil para consultar la clase y reservar tu lugar.")}

                {EmailButton(SiteUrl, "Ver TurnoFácil")}";

            var message = new EmailMessage
            {
                From = "turnos@turnofacilapp.com.ar",
                Subject = "¡Se liberó un lugar en una clase!",
                HtmlBody = EmailLayout("¡Hay un lugar disponible!", content)
            };

            message.To.Add(to);

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

            var safeUserName = WebUtility.HtmlEncode(userName);
            var safeUserEmail = WebUtility.HtmlEncode(userEmail);
            var safeTenantName = WebUtility.HtmlEncode(tenantName);
            var safePlanName = WebUtility.HtmlEncode(planName);

            var reviewUrl = $"{SiteUrl}/crear-negocio?token={Uri.EscapeDataString(token)}";

            var content = $@"
                {EmailParagraph("Se recibió una nueva solicitud para crear un negocio en TurnoFácil.")}

                <div style=""
                    margin:24px 0;
                    padding:20px;
                    background-color:#F1EEF3;
                    border:1px solid #99A1AF;
                    border-radius:12px;
                "">
                    <p style=""margin:0 0 6px;font-size:12px;color:#857780;"">SOLICITANTE</p>
                    <p style=""margin:0 0 16px;font-size:15px;color:#29252b;font-weight:bold;"">{safeUserName}</p>

                    <p style=""margin:0 0 6px;font-size:12px;color:#857780;"">CORREO</p>
                    <p style=""margin:0 0 16px;font-size:15px;color:#29252b;"">{safeUserEmail}</p>

                    <p style=""margin:0 0 6px;font-size:12px;color:#857780;"">NEGOCIO</p>
                    <p style=""margin:0 0 16px;font-size:15px;color:#29252b;font-weight:bold;"">{safeTenantName}</p>

                    <p style=""margin:0 0 6px;font-size:12px;color:#857780;"">PLAN SOLICITADO</p>
                    <p style=""margin:0;font-size:15px;color:#29252b;"">{safePlanName}</p>
                </div>

                {EmailParagraph("El comprobante de pago enviado por el usuario está adjunto a este correo.")}

                {EmailParagraph("Si revisaste el comprobante y es correcto, podés continuar con la creación del negocio.")}

                {EmailButton(reviewUrl, "Revisar solicitud")}";

            var message = new EmailMessage
            {
                From = "turnos@turnofacilapp.com.ar",
                Subject = $"Solicitud de nuevo negocio - {tenantName}",
                HtmlBody = EmailLayout("Nueva solicitud de negocio", content)
            };

            message.To.Add("dante.orsetti@gmail.com");

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
            var safeTenantName = WebUtility.HtmlEncode(tenantName);

            var content = $@"
                {EmailParagraph($@"
                    ¡Tenemos buenas noticias! Tu negocio
                    <strong style=""color:#29252b;"">{safeTenantName}</strong>
                    ya está creado y listo para usar en TurnoFácil.
                ")}

                {EmailParagraph("Ahora podés ingresar a la plataforma y empezar a organizar tu negocio, tus clases y tus alumnos.")}

                {EmailButton(SiteUrl, "Ingresar a TurnoFácil")}

                <p style=""
                    margin:24px 0 0;
                    padding-top:20px;
                    border-top:1px solid #99A1AF;
                    font-size:14px;
                    line-height:1.7;
                    color:#857780;
                "">
                    ¡Gracias por confiar en TurnoFácil!
                </p>";

            var message = new EmailMessage
            {
                From = "turnos@turnofacilapp.com.ar",
                Subject = "¡Tu negocio ya está listo en TurnoFácil!",
                HtmlBody = EmailLayout("¡Tu negocio ya está listo!", content)
            };

            message.To.Add(to);

            await _resend.EmailSendAsync(message);
        }
    }
}