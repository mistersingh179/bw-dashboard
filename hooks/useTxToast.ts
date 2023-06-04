import { ToastId, useToast } from "@chakra-ui/react";
import {ReactNode, useRef} from "react";

const useTxToast = () => {
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const success = (title: string, description: string | ReactNode) => {
    toastIdRef.current = toast({
      title,
      description,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };
  const failure = (title: string, description: string) => {
    if (toastIdRef.current) {
      toast.close(toastIdRef.current);
    }
    toast({
      title,
      description,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  };

  const info = (title: string, description: string) => {
    if (toastIdRef.current) {
      toast.close(toastIdRef.current);
    }
    toast({
      title,
      description,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return { success, failure, info };
};

export default useTxToast;
