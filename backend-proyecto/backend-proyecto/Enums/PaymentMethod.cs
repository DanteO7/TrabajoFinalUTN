namespace backend_proyecto.Enums
{
    public static class PaymentMethod
    {
        public const string CASH = "Cash";
        public const string BANK_TRANSFER = "Bank Transfer";
        public const string DEBIT_CARD = "Debit Card";
        public const string MERCADO_PAGO = "Mercado Pago";
        public const string QR = "QR";
    }

    public static class PaymentStatus
    {
        public const string PENDING = "Pending";
        public const string PAID = "Paid";
        public const string REJECTED = "Rejected";
        public const string CANCELLED = "Cancelled";
    }
}