import http from "http";
import express from "express";
import StatusMonitor from "express-status-monitor";
import dotenv from "dotenv";
import Redis from "./redis.js";
import OAuthRoutes from "./routes/googleAuth/oauth2.js";

const bootstrap = async () => {
  const app = express();
  const server = http.createServer(app);

  dotenv.config();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  await Redis.loader();

  app.use("/google/oauth", OAuthRoutes);

  app.get("/", (req, res) => {
    res.send("Welcome to AutoMailer");
  });

  app.get("/done", (req, res) => {
    res.send(
      `Now your account is connected to AutoMailer. \n 
      You can close this tab now. \n 
      we will send you an email from your account until you remove your account from AutoMailer by going to this link: \n http://localhost:${
        process.env.PORT || 3000
      }/google/oauth/signout`
    );
  });

  app.get(
    "/health",
    StatusMonitor({
      title: "AutoMailer",
      path: "/health",
    })
  );

  return { app, server };
};

export default bootstrap;
