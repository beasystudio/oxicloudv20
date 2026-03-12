import { Users, Mail, CheckCircle, Quote } from 'lucide-react';
import { ToolCard } from './ToolCard';
import { MainNavigation } from './MainNavigation';
import { tools } from '@/data/tools';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import oxiCloudLogo from '@/assets/oxicloud-logo.png';
import { Link } from 'react-router-dom';
import { useMockAuth } from '@/contexts/MockAuthContext';
export const SorareBasicLanding = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const {
    currentUser
  } = useMockAuth();

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('sorare-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch {
        // If parsing fails, use empty array
        setFavorites([]);
      }
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('sorare-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = (toolName: string) => {
    setFavorites(prev => {
      if (prev.includes(toolName)) {
        return prev.filter(name => name !== toolName);
      } else {
        return [...prev, toolName];
      }
    });
  };

  // Sort tools: favorites first, then the rest
  const sortedTools = [...tools].sort((a, b) => {
    const aIsFavorite = favorites.includes(a.name);
    const bIsFavorite = favorites.includes(b.name);
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0; // Keep original order within each group
  });
  return <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto px-6 lg:px-8">
        {/* Hero Section */}
        <header className="text-center pt-20 pb-16 max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-primary">
              OxiCloud
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light mb-8">
            Empowering architects to build sustainably through data-driven clarity
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed font-light max-w-3xl mx-auto mb-8">
            Transform complex environmental data into actionable insights. OxiCloud calculates NOx emissions, 
            assesses environmental impact, and uses AI to optimize construction projects for regulatory compliance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {currentUser ? <Button size="lg" className="gap-2">
                Get Started
              </Button> : <>
                <Button size="lg" asChild>
                  <Link to="/login" className="bg-secondary-foreground text-orange-600">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </>}
          </div>
        </header>

        {/* What OxiCloud Does */}
        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
            What OxiCloud Does
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {sortedTools.map(tool => <ToolCard key={tool.name} name={tool.name} description={tool.description} url={tool.url} icon={tool.icon} iconColor={tool.iconColor} comingSoon={tool.comingSoon} isFavorite={favorites.includes(tool.name)} onToggleFavorite={toggleFavorite} />)}
          </div>
        </section>

        {/* Brand Values Section */}
        <section className="mb-24 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
            Our Values
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Autonomy */}
            <div className="group bg-card rounded-2xl p-8 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 border border-border hover:border-primary/30 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Autonomy
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Puts control and clarity back in the hands of architects
                  </p>
                </div>
              </div>
            </div>

            {/* Efficiency */}
            <div className="group bg-card rounded-2xl p-8 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 border border-border hover:border-primary/30 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Efficiency
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Automates complexity, saves time, and simplifies compliance
                  </p>
                </div>
              </div>
            </div>

            {/* Reliability */}
            <div className="group bg-card rounded-2xl p-8 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 border border-border hover:border-primary/30 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Reliability
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Ensures precision, transparency, and trust in every result
                  </p>
                </div>
              </div>
            </div>

            {/* Innovation */}
            <div className="group bg-card rounded-2xl p-8 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 border border-border hover:border-primary/30 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Innovation
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Fuses AI, sustainability, and modern design intelligence
                  </p>
                </div>
              </div>
            </div>

            {/* Responsibility */}
            <div className="group bg-card rounded-2xl p-8 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 border border-border hover:border-primary/30 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Responsibility
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Promotes environmentally conscious and accountable practice
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Target Audience Section */}
        

        {/* Testimonials Section */}
        <section className="mb-24 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-foreground">
            Trusted by Leading Firms
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            See what architects and engineers across the Benelux say about OxiCloud
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 - Netherlands */}
            <Card className="p-8 rounded-3xl border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <Quote className="w-10 h-10 text-primary/30 mb-4" />
                <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                  "OxiCloud transformed how we handle environmental compliance. What used to take weeks now takes hours. The NOx calculations are precise and the reports are client-ready."
                </p>
                <div className="border-t border-border pt-6">
                  <p className="font-semibold text-foreground">Pieter van der Berg</p>
                  <p className="text-sm text-muted-foreground">Lead Architect</p>
                  <p className="text-sm text-primary font-medium mt-1">MVRDV • Rotterdam, NL</p>
                </div>
              </div>
            </Card>

            {/* Testimonial 2 - Belgium */}
            <Card className="p-8 rounded-3xl border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <Quote className="w-10 h-10 text-primary/30 mb-4" />
                <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                  "The AI-powered optimization suggestions have helped us reduce project emissions by 23% on average. Our clients love the transparency and detailed reporting."
                </p>
                <div className="border-t border-border pt-6">
                  <p className="font-semibold text-foreground">Sophie Claessens</p>
                  <p className="text-sm text-muted-foreground">Sustainability Director</p>
                  <p className="text-sm text-primary font-medium mt-1">Jaspers-Eyers Architects • Antwerp, BE</p>
                </div>
              </div>
            </Card>

            {/* Testimonial 3 - Luxembourg */}
            <Card className="p-8 rounded-3xl border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <Quote className="w-10 h-10 text-primary/30 mb-4" />
                <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                  "Finally, a tool that speaks the language of architects. The interface is intuitive and the compliance automation saves our team countless hours every month."
                </p>
                <div className="border-t border-border pt-6">
                  <p className="font-semibold text-foreground">Marc Hoffmann</p>
                  <p className="text-sm text-muted-foreground">Managing Partner</p>
                  <p className="text-sm text-primary font-medium mt-1">Metaform Architects • Luxembourg City, LU</p>
                </div>
              </div>
            </Card>

            {/* Testimonial 4 - Netherlands */}
            <Card className="p-8 rounded-3xl border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <Quote className="w-10 h-10 text-primary/30 mb-4" />
                <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                  "We integrated OxiCloud into our workflow six months ago. The ROI was immediate—faster permit approvals and happier clients who appreciate our environmental commitment."
                </p>
                <div className="border-t border-border pt-6">
                  <p className="font-semibold text-foreground">Eva de Groot</p>
                  <p className="text-sm text-muted-foreground">Project Manager</p>
                  <p className="text-sm text-primary font-medium mt-1">UNStudio • Amsterdam, NL</p>
                </div>
              </div>
            </Card>

            {/* Testimonial 5 - Belgium */}
            <Card className="p-8 rounded-3xl border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <Quote className="w-10 h-10 text-primary/30 mb-4" />
                <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                  "The detailed environmental impact assessments have become a key differentiator for our practice. OxiCloud helps us win projects by demonstrating our sustainability expertise."
                </p>
                <div className="border-t border-border pt-6">
                  <p className="font-semibold text-foreground">Thomas Verhoeven</p>
                  <p className="text-sm text-muted-foreground">Senior Engineer</p>
                  <p className="text-sm text-primary font-medium mt-1">BURO II & ARCHI+I • Ghent, BE</p>
                </div>
              </div>
            </Card>

            {/* Testimonial 6 - Netherlands */}
            <Card className="p-8 rounded-3xl border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <Quote className="w-10 h-10 text-primary/30 mb-4" />
                <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                  "As a firm focused on sustainable design, OxiCloud aligns perfectly with our values. The platform makes it easy to quantify and communicate our environmental impact."
                </p>
                <div className="border-t border-border pt-6">
                  <p className="font-semibold text-foreground">Lisa Jansen</p>
                  <p className="text-sm text-muted-foreground">Design Director</p>
                  <p className="text-sm text-primary font-medium mt-1">Powerhouse Company • Rotterdam, NL</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="mb-24 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-foreground">
            Pricing Plans
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your project needs
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card className="p-8 rounded-3xl border-border/50 hover:border-border transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Starter</h3>
                <p className="text-muted-foreground mb-4">Perfect for small projects</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">€299</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Up to 5 projects/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">NOx calculation & reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Basic AI optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Email support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">Get Started</Button>
            </Card>

            {/* Professional Plan */}
            <Card className="p-8 rounded-3xl border-primary shadow-lg relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Professional</h3>
                <p className="text-muted-foreground mb-4">For growing practices</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">€699</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Unlimited projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Advanced AI optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Compliance automation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Team collaboration</span>
                </li>
              </ul>
              <Button className="w-full">Get Started</Button>
            </Card>

            {/* Enterprise Plan */}
            <Card className="p-8 rounded-3xl border-border/50 hover:border-border transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Enterprise</h3>
                <p className="text-muted-foreground mb-4">For large organizations</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">Custom</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Everything in Professional</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">On-premise deployment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">SLA guarantee</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </Card>
          </div>
        </section>

        {/* Get in Touch Section */}
        <section className="mb-24 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 rounded-3xl p-12 text-center border border-border/50">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
              <Mail className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Ready to transform your construction projects with AI-powered environmental compliance? 
              Let's discuss how OxiCloud can help you build sustainably.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? <>
                  <Button size="lg" className="gap-2">
                    <Mail size={18} />
                    Request Demo
                  </Button>
                  <Button size="lg" variant="outline">
                    Contact Sales
                  </Button>
                </> : <>
                  <Button size="lg" asChild>
                    <Link to="/login" className="bg-secondary-foreground">Get Started</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-32 py-12 bg-muted/20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} OxiCloud. All rights reserved.
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              Empowering architects to build sustainably through data-driven clarity.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};