namespace backend_proyecto.Utils
{
    public static class TimeHelper
    {
        private static readonly TimeZoneInfo Argentina =
            TimeZoneInfo.FindSystemTimeZoneById(
                "America/Argentina/Buenos_Aires"
            );

        public static DateTime Now()
        {
            return TimeZoneInfo.ConvertTimeFromUtc(
                DateTime.UtcNow,
                Argentina
            );
        }

        public static DateTime UtcNow()
        {
            return DateTime.UtcNow;
        }

        public static DateTime ArgentinaTodayStartUtc()
        {
            var argentinaToday =
                DateTime.SpecifyKind(
                    Now().Date,
                    DateTimeKind.Unspecified
                );

            return TimeZoneInfo.ConvertTimeToUtc(
                argentinaToday,
                Argentina
            );
        }
    }
}