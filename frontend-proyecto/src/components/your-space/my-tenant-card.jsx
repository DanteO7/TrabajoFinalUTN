import React from "react";

export default function MyTenantCard({ myTenant, onClick }) {
  const roleConfig = {
    Owner: {
      text: "Dueño",
      className: "border-purple-600 text-purple-600",
    },
    Professor: {
      text: "Profesor",
      className: "border-blue-600 text-blue-600",
    },
    Student: {
      text: "Alumno",
      className: "border-yellow-600 text-yellow-600",
    },
  };
  const role = roleConfig[myTenant.role];

  return (
    <div
      onClick={onClick}
      className="border w-full cursor-pointer place-self-center p-5 rounded-xl flex justify-between shadow-md hover:shadow-lg transition-all duration-300"
    >
      <div>
        <h4 className="font-semibold text-xl lg:text-2xl">{myTenant.name}</h4>
        <span className="text-[14px]">{myTenant.ownerName}</span>
      </div>
      <div className="flex flex-col justify-between">
        {myTenant.isActive ? (
          <span className="border rounded-4xl px-2 text-[13px] border-green-600 text-green-600">
            Activo
          </span>
        ) : (
          <span className="border rounded-4xl px-2 text-[13px] border-red-600 text-red-600">
            Inactivo
          </span>
        )}

        <span
          className={`border rounded-4xl px-2 text-[13px] ${role.className}`}
        >
          {role.text}
        </span>
      </div>
    </div>
  );
}
