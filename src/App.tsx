import { ClerkProvider } from "@clerk/clerk-react";
import { LandingPage } from "./components/LandingPage";
import { DashboardView } from "./components/DashboardView";
import { Navbar } from "./components/Navbar";
import { PRODUCT_EXPERIENCE_PATH } from "./routes";

// Get Publishable Key from environment
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key. Auth features will be disabled.");
}

function ProductExperiencePage({ authEnabled }: { authEnabled: boolean }) {
  return <DashboardView authEnabled={authEnabled} />;
}

function MarketingPage({ authEnabled }: { authEnabled: boolean }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar authEnabled={authEnabled} />

      <main className="flex-1">
        <LandingPage authEnabled={authEnabled} />
      </main>

      <footer className="bg-base-100 py-12 border-t border-base-300">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-content font-bold text-xs">P</div>
              <span className="font-heading font-bold italic">ProjectHub</span>
            </div>
            <div className="flex gap-8 text-sm text-base-content/60">
              <a href="#" className="hover:text-primary">Privacy</a>
              <a href="#" className="hover:text-primary">Terms</a>
              <a href="#" className="hover:text-primary">Status</a>
              <a href="#" className="hover:text-primary">Support</a>
            </div>
            <p className="text-xs text-base-content/45">© 2026 ProjectHub Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const authEnabled = Boolean(PUBLISHABLE_KEY);
  const isProductExperiencePage = window.location.pathname === PRODUCT_EXPERIENCE_PATH;
  const content = isProductExperiencePage ? (
    <ProductExperiencePage authEnabled={authEnabled} />
  ) : (
    <MarketingPage authEnabled={authEnabled} />
  );

  if (!authEnabled) {
    return content;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {content}
    </ClerkProvider>
  );
}
