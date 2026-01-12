using BC = BCrypt.Net.BCrypt;

namespace backend_proyecto.Services
{
    public interface IEncoderServices
    {
        string Encode(string value);
        bool Verify(string value, string hash);
    }
    public class EncoderServices : IEncoderServices
    {
        public string Encode(string value)
        {
            var salt = BC.GenerateSalt(12);
            return BC.HashPassword(value, salt);
        }

        public bool Verify(string value, string hash)
        {
            return BC.Verify(value, hash);
        }
    }
}
