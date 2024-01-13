import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();
class Redis {
  static instance;

  static counter;
  static loader = async () => {
    try {
      const client = createClient({
        password: process.env.PASSWORD,
        socket: {
          host: "redis-16928.c309.us-east-2-1.ec2.cloud.redislabs.com",
          port: 16928,
        },
      });
      client.on("error", (err) => console.log("Redis Client Error", err));
      client.on("ready", () => console.log("Redis Client Ready"));
      await client.connect();
      console.log("Redis Client Connected");
      Redis.instance = client;
      let counter = await Redis.instance.get("counter");
      if (!counter) {
        await Redis.instance.set("counter", 0);
      }
      Redis.counter = counter;
    } catch (error) {
      console.log(error);
    }
  };

  static getCounter = async () => {
    const counter = await Redis.instance.get("counter");

    return counter;
  };
}

export default Redis;
