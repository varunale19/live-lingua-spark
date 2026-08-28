import React from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";
import { getRouter } from "./router.js";

const router = getRouter();

hydrateRoot(document, React.createElement(StartClient, { router }));
