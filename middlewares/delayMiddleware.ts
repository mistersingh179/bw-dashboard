import {Middleware} from "next-api-middleware";

export const sleep = async (ms: number) =>{
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  })
}
const delayMiddleware:Middleware = async (req, res, next) => {
  if(process.env.NODE_ENV !== "production"){
    await sleep(0);
  }
  await next();
}

export default delayMiddleware;