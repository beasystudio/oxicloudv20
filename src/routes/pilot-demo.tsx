import { createFileRoute } from "@tanstack/react-router";

import { SpaAppRoute } from "@/components/SpaAppRoute";

export const Route = createFileRoute("/pilot-demo")({
  component: SpaAppRoute,
});
