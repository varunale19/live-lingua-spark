import {
  createStartHandler,
  defaultRenderHandler,
} from "@tanstack/react-start/server";
import { getRouter } from "./router.js";

const handler = createStartHandler({
  handler: defaultRenderHandler,
  createRouter: getRouter,
});

export default {
  async fetch(request) {
    return handler(request);
  },
};
