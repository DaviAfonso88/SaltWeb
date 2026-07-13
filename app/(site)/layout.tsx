import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-grow relative">{children}</main>
      <Footer />
    </>
  );
}
