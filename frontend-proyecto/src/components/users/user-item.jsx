export default function UserItem({ user, onSelect }) {
  return (
    <div
      onClick={() => onSelect(user)}
      className="cursor-pointer rounded-xl border p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex justify-between">
        <div>
          <h3 className="text-xl font-semibold">
            {user.name} {user.surname}
          </h3>

          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      <p className="mt-3 text-gray-500">{user.phoneNumber || "Sin teléfono"}</p>
    </div>
  );
}
