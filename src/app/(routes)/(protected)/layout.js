import Footer from "@/app/_components/footer";
import Navbar from "@/app/_components/navbar";

export default function ProtectedLayout({ children }) {
  return (
<div className="grid grid-rows-[min-content_1fr_min-content] min-h-full 
      font-secondary antialiased gap-4"
      >
        <header>
          <nav>
            <Navbar />
          </nav>
        </header>
        <main className="container mx-auto px-4">
          {children}
        </main>
        <footer className="container mx-auto p-4">
          <Footer />
        </footer>
      </div>
  );
}
