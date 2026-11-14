import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { MessageCard } from "@/components/ui/MessageCard";

export default function AuthErrorPage() {
  return (
    <MessageCard icon={<TriangleAlert className="h-6 w-6" />} eyebrow="Link problem" title="This link didn't work">
      <p>It may have expired or already been used. Links work once, in the same browser you signed up with.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/login" className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover">
          Go to login
        </Link>
        <Link href="/forgot-password" className="rounded-lg border border-line px-5 py-3 text-sm font-semibold text-ink hover:border-brand">
          Reset password
        </Link>
      </div>
    </MessageCard>
  );
}
