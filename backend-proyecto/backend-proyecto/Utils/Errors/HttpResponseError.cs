using System.Net;

namespace backend_proyecto.Utils.Errors
{
    public class HttpResponseError : Exception
    {
        public HttpStatusCode StatusCode { get; set; }
        public HttpResponseError(HttpStatusCode statusCode, string message) : base(message)
        {
            StatusCode = statusCode;
        }
    }
}
