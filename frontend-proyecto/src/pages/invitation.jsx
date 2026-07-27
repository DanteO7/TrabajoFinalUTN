import { useQuery } from "@tanstack/react-query";
import MainLayout from "../layouts/main-layout";
import { getInvitationInfo } from "../services/invitation";

export default function Invitation({ token }) {
  const { data, isLoading } = useQuery({
    queryKey: ["getInvitationInfo", token],
    queryFn: () => getInvitationInfo(token),
  });
  console.log(data);

  return (
    <MainLayout>
      <h2>
        Te invitaron a {data?.tenantName} como {data?.role}
      </h2>
    </MainLayout>
  );
}
