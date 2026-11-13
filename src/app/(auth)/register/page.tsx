import { ComingSoon } from "@/components/ui/ComingSoon";
import { isRole } from "@/lib/types";

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { role } = await searchParams;
  const isProvider = isRole(role) && role === "provider";
  return (
    <ComingSoon
      title={isProvider ? "Provider registration" : "Patient registration"}
      owner={isProvider ? "Person B (provider side)" : "Person A (patient side)"}
    />
  );
}
