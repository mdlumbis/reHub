// Always render per request: shows the signed-in provider and today's date.
export const dynamic = "force-dynamic";

import { ProviderSidebar } from "@/components/layout/ProviderSidebar";
import { getProviderContext, getReferralInbox } from "@/lib/provider";

/** Provider workspace: sidebar + content. Access is restricted to providers in src/lib/supabase/proxy.ts. */
export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const { profile, details, displayName, initials } = await getProviderContext();
  const inbox = await getReferralInbox(profile.id);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <ProviderSidebar
        displayName={displayName}
        initials={initials}
        profession={details?.profession ?? "Provider"}
        inboxCount={inbox.length}
      />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
