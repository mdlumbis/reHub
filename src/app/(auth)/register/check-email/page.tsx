import Link from "next/link";
import { MailCheck } from "lucide-react";
import { MessageCard } from "@/components/ui/MessageCard";

export default async function CheckEmailPage({ searchParams }: PageProps<"/register/check-email">) {
  const { email } = await searchParams;

  return (
    <MessageCard icon={<MailCheck className="h-6 w-6" />} eyebrow="Almost there" title="Check your e-mail">
      <p>
        We sent a confirmation link to{" "}
        <span className="font-medium text-ink">{typeof email === "string" ? email : "your e-mail"}</span>. Open it to
        activate your account.
      </p>
      <p className="mt-4 text-sm">
        Didn&apos;t get it? Check your spam folder, or{" "}
        <Link href="/register" className="font-medium text-brand hover:underline">
          register again
        </Link>
        .
      </p>
    </MessageCard>
  );
}
