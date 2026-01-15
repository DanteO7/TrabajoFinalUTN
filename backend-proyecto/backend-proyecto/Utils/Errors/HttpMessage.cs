namespace backend_proyecto.Utils.Errors
{
    public class HttpMessage
    {
        public string Message { get; set; }
        public HttpMessage(string message)
        {
            Message = message;
        }
    }
}
