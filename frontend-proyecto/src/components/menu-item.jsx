import { Link, useLocation } from "wouter";
import React from "react";

export default function MenuItem({ href, icon: Icon, children, onClick }) {
  const [location] = useLocation();

  const active =
    href === "/"
      ? location === "/"
      : location.startsWith(`/${href.replace("/", "")}`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-2.5
        px-3 py-2 rounded-xl
        transition-all duration-200
        ${
          active
            ? "bg-[#2b2b2b] text-white"
            : "hover:bg-[#1c1c1c] text-gray-300"
        }
      `}
    >
      <Icon size={20} />
      <span>{children}</span>
    </Link>
  );
}
