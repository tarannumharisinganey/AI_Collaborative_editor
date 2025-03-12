export {}; // Ensures this file is treated as a module

import * as Y from "yjs"; // Import Yjs for type declaration
import { User } from "./types"; // Import User type for session claims

declare global {
  namespace globalThis {
    var __yDoc: Y.Doc; // Explicitly declare __yDoc
  }

  interface CustomJwtSessionClaims extends User {} // Extend session claims if needed
}
