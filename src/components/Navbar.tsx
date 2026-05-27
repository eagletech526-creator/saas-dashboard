import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUCT_EXPERIENCE_PATH } from "../routes";

type NavbarProps = {
  authEnabled: boolean;
};

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-600 text-white shadow-sm shadow-sky-200">
        <div className="h-3.5 w-3.5 rotate-45 rounded-[3px] border-2 border-white/90" />
      </div>
      <span className="font-heading text-xl font-bold tracking-tight text-slate-950">ProjectHub</span>
    </div>
  );
}

export function Navbar({ authEnabled }: NavbarProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-50 w-full bg-transparent">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-12">
        <a href="/" aria-label="ProjectHub home">
          <Logo />
        </a>

        <nav className="hidden items-center gap-10 lg:flex">
          <a href="#features" className="text-sm font-semibold text-slate-950 transition-colors hover:text-sky-600">Features</a>
          <a href="#solutions" className="flex items-center gap-1.5 text-sm font-semibold text-slate-950 transition-colors hover:text-sky-600">
            Solutions <ChevronDown className="h-3.5 w-3.5" />
          </a>
          <a href="#pricing" className="text-sm font-semibold text-slate-950 transition-colors hover:text-sky-600">Pricing</a>
          <a href="#resources" className="flex items-center gap-1.5 text-sm font-semibold text-slate-950 transition-colors hover:text-sky-600">
            Resources <ChevronDown className="h-3.5 w-3.5" />
          </a>
          <a href="#company" className="flex items-center gap-1.5 text-sm font-semibold text-slate-950 transition-colors hover:text-sky-600">
            Company <ChevronDown className="h-3.5 w-3.5" />
          </a>
        </nav>

        <div className="flex items-center gap-4">
          {authEnabled ? (
            <>
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl={PRODUCT_EXPERIENCE_PATH}>
                  <button className="hidden text-sm font-semibold text-slate-950 transition-colors hover:text-sky-600 sm:inline-flex">
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal" forceRedirectUrl={PRODUCT_EXPERIENCE_PATH}>
                  <Button className="h-10 rounded-md bg-sky-600 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-200 hover:bg-sky-700">
                    Get Started Free
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </>
          ) : (
            <>
              <button className="hidden text-sm font-semibold text-slate-950 sm:inline-flex" disabled title="Add VITE_CLERK_PUBLISHABLE_KEY to enable auth">
                Log in
              </button>
              <Button className="h-10 rounded-md bg-sky-600 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-200 hover:bg-sky-700" disabled title="Add VITE_CLERK_PUBLISHABLE_KEY to enable auth">
                Get Started Free
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
