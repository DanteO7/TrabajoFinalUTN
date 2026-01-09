using backend_proyecto.Config;
using backend_proyecto.Models;

namespace backend_proyecto.Repositories
{
    public interface IPaymentRepository : IRepository<Payment> { }
    public class PaymentRepository : Repository<Payment>, IPaymentRepository
    {
        private readonly ApplicationDbContext _db;
        public PaymentRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
