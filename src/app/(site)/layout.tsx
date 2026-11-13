import { MainNav } from "@/components/layout/MainNav";
import { Footer } from "@/components/layout/Footer";

/** Layout for public and patient-facing pages: full nav + footer. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNav />
      {children}
      <Footer />
    </>
  );
}
