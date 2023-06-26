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
import Script from "next/script";

type ComponentWithAuth = React.ComponentType<any> & {
  auth?: boolean;
};

type AppPropsWithCompWithAuth = AppProps & { Component: ComponentWithAuth };

const App = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithCompWithAuth) => {
  return (
    <>
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
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <meta name="referrer" content="no-referrer" />
            <link rel="icon" href="/favicon.ico" />

            <link
              rel="preload"
              href="/api/campaigns"
              as="fetch"
              crossOrigin="anonymous"
            />
            <link
              rel="preload"
              href="/api/websites"
              as="fetch"
              crossOrigin="anonymous"
            />
            <link
              rel="preload"
              href="/api/dashboard"
              as="fetch"
              crossOrigin="anonymous"
            />
            <link
              rel="preload"
              href="/api/user"
              as="fetch"
              crossOrigin="anonymous"
            />
            <link
              rel="preload"
              href="/api/settings"
              as="fetch"
              crossOrigin="anonymous"
            />
            <link
              rel="preload"
              href="/api/categories"
              as="fetch"
              crossOrigin="anonymous"
            />
          </Head>
        </SessionProvider>
        <Analytics />
      </ChakraProvider>
      <Script id="chaport" strategy="afterInteractive">
        {process.env.NEXT_PUBLIC_BW_SCRIPT_BASE_URL !==
          "http://localhost:8000" &&
          `
          (function(w,d,v3){
          w.chaportConfig = {
          appId : '64999a630d8b6b3074ce8d8c'
          };
          
          if(w.chaport)return;v3=w.chaport={};v3._q=[];v3._l={};v3.q=function(){v3._q.push(arguments)};v3.on=function(e,fn){if(!v3._l[e])v3._l[e]=[];v3._l[e].push(fn)};var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://app.chaport.com/javascripts/insert.js';var ss=d.getElementsByTagName('script')[0];ss.parentNode.insertBefore(s,ss)})(window, document);
        `}
      </Script>
    </>
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
