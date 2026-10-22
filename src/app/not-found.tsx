import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm card p-8 text-center">
        <div className="mx-auto size-12 rounded-full bg-primary-light text-primary flex items-center justify-center mb-4">
          <Compass className="size-5" />
        </div>
        <h1 className="text-lg font-semibold">Page not found</h1>
        <p className="text-sm text-muted mt-2">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link href="/dashboard" className="btn-primary px-4 py-2 mt-6 inline-flex">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
