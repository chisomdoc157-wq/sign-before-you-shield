
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StartupExperience } from "../components/safesign/StartupExperience";

function NotFoundComponent() {
  return (
    <div className="bg-background flex items-center justify-center min-h-screen px-4">
      <div className="max-w-md text-center">
        <h1 className="font-bold text-7xl text-foreground">404</h1>
        <h2 className="font-semibold mt-4 text-foreground text-xl">
          Page not found
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="bg-primary font-medium hover:bg-primary/90 inline-flex items-center justify-center px-4 py-2 rounded-md text-primary-foreground text-sm transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="bg-background flex items-center justify-center min-h-screen px-4">
      <div className="max-w-md text-center">
        <h1 className="font-semibold text-foreground text-xl tracking-tight">
          This page didn't load
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-primary font-medium hover:bg-primary/90 inline-flex items-center justify-center px-4 py-2 rounded-md text-primary-foreground text-sm transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="bg-background border border-input font-medium hover:bg-accent inline-flex items-center justify-center px-4 py-2 rounded-md text-foreground text-sm transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "SafeSign — Web3 Transaction & Token Security",
      },
      {
        name: "description",
        content:
          "Verify blockchain transactions, match crypto payments, and check token security across multiple networks with SafeSign.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "SafeSign" },
      {
        property: "og:title",
        content: "SafeSign — Web3 Transaction & Token Security",
      },
      {
        property: "og:description",
        content:
          "Verify transactions. Match payments. Check token security. Make safer Web3 decisions with SafeSign.",
      },
      {
        property: "og:url",
        content: "https://sign-before-you-shield.vercel.app/",
      },
      {
        property: "og:image",
        content:
          "https://sign-before-you-shield.vercel.app/safesign-preview.png?v=2",
      },
      {
        property: "og:image:secure_url",
        content:
          "https://sign-before-you-shield.vercel.app/safesign-preview.png?v=2",
      },
      {
        property: "og:image:alt",
        content: "SafeSign Web3 Security",
      },
      {
        property: "og:image:type",
        content: "image/png",
      },
      {
        name: "twitter:image",
        content:
          "https://sign-before-you-shield.vercel.app/safesign-preview.png?v=2",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/safesign-icon.svg",
        type: "image/svg+xml",
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <StartupExperience>
        {/* Keep this Outlet: all nested SafeSign pages render here. */}
        <Outlet />
      </StartupExperience>
    </QueryClientProvider>
  );
}
