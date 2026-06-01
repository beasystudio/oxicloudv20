import { createFileRoute } from "@tanstack/react-router";

import { SpaAppRoute } from "@/components/SpaAppRoute";

export const Route = createFileRoute("/dashboard/project-binder")({
  component: SpaAppRoute,
});
