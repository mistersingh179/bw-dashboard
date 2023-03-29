import TopNav from "./TopNav";
import React, { ReactNode } from "react";
import { Container } from "@chakra-ui/react";
import { useRouter } from "next/router";

type LayoutProps = {
  children: ReactNode;
};
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  return (
    <>
      {router.pathname != "/" && <TopNav />}
      <Container maxW={"container.xl"}>{children}</Container>
    </>
  );
};

export default Layout;
