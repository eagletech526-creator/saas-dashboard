import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const navItems = [
    { href: "#features", label: "Features" },
    { href: "#solutions", label: "Solutions" },
    { href: "#pricing", label: "Pricing" },
    { href: "#resources", label: "Resources" },
    { href: "#company", label: "Company" },
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-50 w-full bg-transparent">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-12">
        <a href="/" aria-label="ProjectHub home" onClick={closeMenu}>
          <Logo />
        </a>

        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="flex items-center gap-1.5 text-sm font-semibold text-slate-950 transition-colors hover:text-sky-600">
              {item.label}
              {item.label !== "Features" && item.label !== "Pricing" && <ChevronDown className="h-3.5 w-3.5" />}
            </a>
          ))}
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
                  <Button className="hidden h-10 rounded-md bg-sky-600 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-200 hover:bg-sky-700 sm:inline-flex">
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
              <Button className="hidden h-10 rounded-md bg-sky-600 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-200 hover:bg-sky-700 sm:inline-flex" disabled title="Add VITE_CLERK_PUBLISHABLE_KEY to enable auth">
                Get Started Free
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-md text-slate-950 lg:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="mx-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 lg:hidden">
          <nav className="grid gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="flex min-h-11 items-center justify-between rounded-md px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-sky-600"
              >
                {item.label}
                {item.label !== "Features" && item.label !== "Pricing" && <ChevronDown className="h-4 w-4" />}
              </a>
            ))}
          </nav>
          <a href={PRODUCT_EXPERIENCE_PATH} onClick={closeMenu} className="mt-3 flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-sky-600 hover:bg-sky-50">
            View Dashboard
          </a>
          <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:hidden">
            {authEnabled ? (
              <>
                <SignedOut>
                  <SignInButton mode="modal" forceRedirectUrl={PRODUCT_EXPERIENCE_PATH}>
                    <Button className="h-11 w-full rounded-md border-slate-200 bg-white text-sm font-semibold text-slate-950 hover:bg-slate-50" variant="outline" onClick={closeMenu}>
                      Log in
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal" forceRedirectUrl={PRODUCT_EXPERIENCE_PATH}>
                    <Button className="h-11 w-full rounded-md bg-sky-600 text-sm font-semibold text-white hover:bg-sky-700" onClick={closeMenu}>
                      Get Started Free
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <a href={PRODUCT_EXPERIENCE_PATH} onClick={closeMenu} className="flex min-h-11 items-center justify-center rounded-md bg-sky-600 px-3 text-sm font-semibold text-white hover:bg-sky-700">
                    Open Workspace
                  </a>
                </SignedIn>
              </>
            ) : (
              <>
                <Button className="h-11 w-full rounded-md border-slate-200 bg-white text-sm font-semibold text-slate-950" variant="outline" disabled title="Add VITE_CLERK_PUBLISHABLE_KEY to enable auth">
                  Log in
                </Button>
                <Button className="h-11 w-full rounded-md bg-sky-600 text-sm font-semibold text-white" disabled title="Add VITE_CLERK_PUBLISHABLE_KEY to enable auth">
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
