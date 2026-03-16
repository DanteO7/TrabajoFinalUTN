using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class ResponseProfessorDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public UserWithoutPassDTO User { get; set; } = null!;
        public int TenantId { get; set; }
        public bool IsActive { get; set; }
        public ICollection<ResponseProfessorSpecialityDTO> Specialities { get; set; } = new List<ResponseProfessorSpecialityDTO>();
    }
}
