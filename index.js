import bootstrap from "./server.js";
import dotenv from "dotenv";
import AutoReply from "./services/autoReply/autoReply.js";
import EventEmitter from "events";

dotenv.config();

const eventEmitter = new EventEmitter();

eventEmitter.on(`start_autoreply`, () => {
  AutoReply.autoReplyForAll();
});

(async () => {
  const { app, server } = await bootstrap();
  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);

    eventEmitter.emit(`start_autoreply`);
  });
})().catch((err) => {
  console.error(err);
});
