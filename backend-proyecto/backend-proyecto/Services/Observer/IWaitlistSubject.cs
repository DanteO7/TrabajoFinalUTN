namespace backend_proyecto.Services.Observer
{
    public interface IWaitlistSubject
    {
        void Attach(IWaitlistObserver observer);
        void Detach(IWaitlistObserver observer);
        Task Notify(int classId);
    }
}
