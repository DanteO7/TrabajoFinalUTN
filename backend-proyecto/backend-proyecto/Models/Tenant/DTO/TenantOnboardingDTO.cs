namespace backend_proyecto.Models.DTOs
{
    public class TenantOnboardingDTO
    {
        public bool Completed { get; set; }
        public int CurrentStep { get; set; }
        public Dictionary<string, bool> Steps { get; set; } = new();
    }

}
