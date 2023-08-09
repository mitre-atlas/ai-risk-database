import React from "react";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";

import { Footer } from "@/components/Footer/Footer";
import { MainNav } from "@/components/Header/MainNav";
import {
  GlobalProgress,
  GlobalProgressProvider,
} from "@/components/GlobalProgress/GlobalProgress";
import { UserTracking } from "@/components/UserTracking/UserTracking";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <SessionProvider session={pageProps.session} basePath="/client-api/auth">
        <GlobalProgressProvider>
          <Head>
            <title>AI Risk Database</title>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </Head>
          <GlobalProgress />

          <div className="flex flex-col min-h-screen">
            <MainNav modelURL={pageProps.modelURL} />
            <Component {...pageProps} />
            <Footer />
          </div>

          <UserTracking />
        </GlobalProgressProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
