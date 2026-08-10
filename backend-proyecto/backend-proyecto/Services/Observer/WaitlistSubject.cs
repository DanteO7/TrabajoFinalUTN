namespace backend_proyecto.Services.Observer
{
    public class WaitlistSubject : IWaitlistSubject
    {
        private readonly List<IWaitlistObserver> _observers = new();

        public WaitlistSubject(IEnumerable<IWaitlistObserver> observers)
        {
            foreach (var observer in observers)
            {
                Attach(observer);
            }
        }

        public void Attach(IWaitlistObserver observer)
        {
            if (!_observers.Contains(observer))
            {
                _observers.Add(observer);
            }
        }

        public void Detach(IWaitlistObserver observer)
        {
            _observers.Remove(observer);
        }

        public async Task Notify(int classId)
        {
            foreach (var observer in _observers)
            {
                await observer.Update(classId);
            }
        }
    }
}
