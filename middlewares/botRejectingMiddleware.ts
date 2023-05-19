import {Middleware} from "next-api-middleware";
import isbot from "isbot";

const botRejectingMiddleware: Middleware = async (req, res, next) => {
  const userAgent = req.headers["user-agent"];
  if(userAgent && !isbot(userAgent)){
    await next();
  }else{
    console.log("rejection form botRejectingMiddleware: ", userAgent);
    res.status(204).end();
  }
};

export default botRejectingMiddleware