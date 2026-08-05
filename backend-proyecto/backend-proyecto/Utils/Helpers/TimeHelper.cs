namespace backend_proyecto.Utils
{
    public static class TimeHelper
    {
        private static readonly TimeZoneInfo Argentina =
            TimeZoneInfo.FindSystemTimeZoneById("America/Argentina/Buenos_Aires");

        public static DateTime Now()
        {
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Argentina);
        }
    }
}