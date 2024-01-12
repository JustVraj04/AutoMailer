import bootstrap from "./server.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const { app, server } = await bootstrap();
  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
})().catch((err) => {
  console.error(err);
});
