import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">403 - Unauthorized</h1>
      <p className="text-lg text-gray-600 mb-6">
        You do not have permission to view this page.
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Go to Home
      </Link>
    </div>
  );
};

export default Unauthorized;
