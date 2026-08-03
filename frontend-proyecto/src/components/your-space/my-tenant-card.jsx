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
    <div className="flex flex-col border w-full cursor-pointer place-self-center p-5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div onClick={onClick} className=" flex justify-between">
        <div>
          <h4 className="font-semibold text-[20px] lg:text-2xl">
            {myTenant.name}
          </h4>
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
      <button className=" bg-[#444] text-[#efefef] w-full py-1 px-4 rounded-xl mt-4 hover:bg-[#333] transition-all duration-200 cursor-pointer">
        Entrar
      </button>
    </div>
  );
}
