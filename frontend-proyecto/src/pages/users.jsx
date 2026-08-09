import { useRef, useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useLocation } from "wouter";

import MainLayout from "../layouts/main-layout";
import { useInfiniteUsers } from "../hooks/useInfiniteUsers";
import UserItem from "../components/users/user-item";
import UserModal from "../components/users/user-modal";
import Loading from "../components/loading";
import UserSearchFilters from "../components/users/user-search-filter";

export default function Users() {
  const [, setLocation] = useLocation();
  const [userSelected, setUserSelected] = useState(null);
  const sentinelRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteUsers();

  const users = data?.pages.flatMap((page) => page.items) ?? [];

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <MainLayout>
      <div className="w-full max-w-6xl mt-12">
        <button
          onClick={() => setLocation("/")}
          className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer"
        >
          <IoArrowBack />
          Volver
        </button>
        <h1 className="text-4xl min-[900px]:text-5xl font-bold mb-2">
          Usuarios registrados
        </h1>
        <p className="text-gray-500 mb-6">
          Administrá todos los usuarios del sistema
        </p>
        <UserSearchFilters />
        <div className="grid min-[900px]:grid-cols-2 gap-4 mt-6">
          {users.map((user) => (
            <UserItem key={user.id} user={user} onSelect={setUserSelected} />
          ))}
        </div>
        <div ref={sentinelRef} className="h-4" />
      </div>

      {userSelected && (
        <UserModal user={userSelected} close={() => setUserSelected(null)} />
      )}
    </MainLayout>
  );
}
