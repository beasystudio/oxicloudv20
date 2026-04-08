import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      
      <main className="flex-1 flex items-center justify-center px-6 pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-lg"
        >
          {/* Large 404 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <span className="text-[120px] sm:text-[180px] font-black leading-none text-foreground/10 select-none">
              404
            </span>
          </motion.div>
          
          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="heading-md text-foreground mb-4">
              Page not found
            </h1>
            <p className="body-md text-muted-foreground mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </motion.div>
          
          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/">
              <Button 
                size="lg" 
                className="bg-foreground text-background hover:bg-foreground/90 font-semibold px-8 py-6 text-base btn-spring group w-full sm:w-auto"
              >
                <Home className="mr-2 h-5 w-5" />
                Return Home
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                size="lg" 
                variant="outline"
                className="border-border text-foreground hover:bg-muted px-8 py-6 text-base w-full sm:w-auto"
              >
                Contact Support
              </Button>
            </Link>
          </motion.div>
          
          {/* Attempted path */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 text-sm text-muted-foreground/60 font-mono"
          >
            {location.pathname}
          </motion.p>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
