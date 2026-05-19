import { useEffect, useState } from "react";

import App from "@/App";

export function SpaAppRoute() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" aria-hidden="true" />;
  }

  return <App />;
}