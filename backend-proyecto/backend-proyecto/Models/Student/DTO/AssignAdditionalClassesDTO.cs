using System.ComponentModel.DataAnnotations;

namespace backend_proyecto.Models.DTOs
{
    public class AssignAdditionalClassesDTO
    {
        [Range(1, 99, ErrorMessage = "La cantidad debe ser un número entero entre 1 y 99.")]
        public int Quantity { get; set; }
    }
}
