namespace backend_proyecto.Services.Observer
{
    public interface IWaitlistObserver
    {
        Task Update(int classId);
    }
}
