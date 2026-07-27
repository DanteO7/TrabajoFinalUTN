namespace backend_proyecto.Utils.Errors
{
    public class CooldownException : Exception
    {
        public int RemainingSeconds { get; }

        public CooldownException(int remainingSeconds)
            : base("Debes esperar antes de solicitar otro correo.")
        {
            RemainingSeconds = remainingSeconds;
        }
    }
}
