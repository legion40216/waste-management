export default function AuthLayout({ children }) {
    return (
    <main className="container mx-auto px-4 grid place-items-center h-full">
        {children}
    </main>
    );
  }