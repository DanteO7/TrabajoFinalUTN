import React from "react";
import BlackButton from "../buttons/black-button";

export default function MyTenantCard({ myTenant }) {
  const roleConfig = {
    Owner: {
      text: "Dueño",
      className: "bg-purple-300 text-purple-600",
    },
    Professor: {
      text: "Profesor",
      className: "bg-blue-300 text-blue-600",
    },
    Student: {
      text: "Alumno",
      className: "bg-orange-200 text-yellow-600",
    },
  };
  const role = roleConfig[myTenant.role];

  return (
    <div className="flex flex-col border w-full cursor-pointer place-self-center p-5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className=" flex justify-between mb-4">
        <div>
          <h4 className="font-semibold text-[20px] lg:text-2xl">
            {myTenant.name}
          </h4>
          <span className="text-[14px]">{myTenant.address}</span>
        </div>
        <div className="flex flex-col gap-2.5 justify-between text-center">
          {myTenant.isActive ? (
            <span className="flex items-center justify-center rounded-full px-2.25 py-px text-[13px] bg-[#a1f3be] text-green-600">
              Activo
            </span>
          ) : (
            <span className="flex items-center justify-center rounded-full px-2.25 py-px text-[13px] bg-red-300 text-red-600">
              Inactivo
            </span>
          )}

          <span
            className={`flex items-center justify-center rounded-full px-2.25 py-px text-[13px] ${role.className}`}
          >
            {role.text}
          </span>
        </div>
      </div>
      <BlackButton text={"Entrar"} textSmall={true} />
    </div>
  );
}
