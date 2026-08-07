namespace backend_projeto.Models.DTOs
{
    public class PagedResponse<T>
    {
        public List<T> Items { get; set; } = new();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public bool HasNextPage { get; set; }
    }
}