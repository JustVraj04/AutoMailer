import http from "http";
import express from "express";
import StatusMonitor from "express-status-monitor";
import dotenv from "dotenv";

const bootstrap = async () => {
  const app = express();
  const server = http.createServer(app);

  dotenv.config();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

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
