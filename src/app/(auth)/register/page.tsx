import { isRole } from "@/lib/types";
import { RegisterView } from "./RegisterView";

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { role } = await searchParams;
  return <RegisterView initialRole={isRole(role) ? role : "patient"} />;
}
