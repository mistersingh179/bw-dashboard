import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import React, { PropsWithChildren, ReactNode } from "react";
import { JSXElement } from "@typescript-eslint/types/dist/generated/ast-spec";
import { ChakraProvider } from "@chakra-ui/react";
import Head from "next/head";
import Layout from "@/components/Layout";
import AuthLoading from "@/components/AuthLoading";
import { Analytics } from "@vercel/analytics/react";

type ComponentWithAuth = React.ComponentType<any> & {
  auth?: boolean;
};

type AppPropsWithCompWithAuth = AppProps & { Component: ComponentWithAuth };

const App = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithCompWithAuth) => {
  return (
    <ChakraProvider>
      <SessionProvider session={session}>
        <Layout>
          {Component.auth ? (
            <Auth>
              <Component {...pageProps} />
            </Auth>
          ) : (
            <Component {...pageProps} />
          )}
        </Layout>
        <Head>
          <title>BrandWeaver.ai</title>
          <meta name="description" content="BrandWeaver.ai App" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="referrer" content="no-referrer" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
      </SessionProvider>
      <Analytics />
    </ChakraProvider>
  );
};
export default App;

type AuthProps = {
  children: ReactNode;
};

const Auth = ({ children }: AuthProps): JSX.Element => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      signIn("google");
    },
  });

  if (status === "loading") {
    return <AuthLoading />;
  }

  return <>{children}</>;
};
