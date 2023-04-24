import { Middleware } from "next-api-middleware";
import isbot from "isbot";

const botRejectingMiddleware: Middleware = async (req, res, next) => {
  const userAgent = req.headers["user-agent"];
  const ans = isbot(userAgent);
  console.log("in bot rejecting middleware with: ", userAgent, ans);
  if(ans){
    res.status(204).end();
  }else{
    await next();
  }
};

export default botRejectingMiddleware