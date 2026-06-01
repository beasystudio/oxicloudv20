import { createFileRoute } from "@tanstack/react-router";

import { SpaAppRoute } from "@/components/SpaAppRoute";

export const Route = createFileRoute("/reset-password")({
  component: SpaAppRoute,
});
