import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Scale, Briefcase, Users, Shield, FileText, Calendar, 
  Clock, DollarSign, MessageSquare, BarChart, 
  Brain, Cloud, CheckCircle, ArrowRight, Menu, X,
  Gavel, FolderOpen, UserCheck, Building2
} from 'lucide-react';
import { useState } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Briefcase className="h-8 w-8" />,
      title: "Case Management",
      description: "Comprehensive case tracking, document management, and real-time collaboration for your entire legal team."
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Court Calendar & Scheduling",
      description: "Never miss a deadline with intelligent calendar management, hearing reminders, and court date tracking."
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Document Automation",
      description: "AI-powered document drafting, templates, e-signatures, and secure cloud storage integration."
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Legal Assistant",
      description: "Case analysis, legal research, compliance checking, and scenario guidance powered by advanced AI."
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Financial Management",
      description: "Invoicing, payment tracking, trust accounting, court fee calculator, and expense management."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Time & Expense Tracking",
      description: "Accurate billable hours tracking, expense logging, and comprehensive financial reporting."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Client Portal",
      description: "Secure client communication, case updates, document sharing, and payment processing."
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      title: "Analytics & Reports",
      description: "Powerful insights into case performance, team productivity, and financial metrics."
    }
  ];

  const userRoles = [
    {
      icon: <Shield className="h-12 w-12" />,
      title: "Super Admin",
      description: "Complete system control with user management, security center, database administration, and system-wide analytics.",
      color: "text-primary"
    },
    {
      icon: <Gavel className="h-12 w-12" />,
      title: "Advocate/Lawyer",
      description: "Manage your cases, clients, hearings, and documents. Use AI tools for legal research and document drafting.",
      color: "text-blue-600"
    },
    {
      icon: <Building2 className="h-12 w-12" />,
      title: "Law Firm",
      description: "Oversee team operations, assign cases, manage payroll, track billable hours, and analyze firm performance.",
      color: "text-purple-600"
    },
    {
      icon: <UserCheck className="h-12 w-12" />,
      title: "Client",
      description: "Track your case status, communicate with your lawyer, upload documents, and make secure payments.",
      color: "text-green-600"
    }
  ];

  const benefits = [
    "Increase productivity by up to 40%",
    "Reduce administrative overhead",
    "Never miss a court date or deadline",
    "Secure cloud storage and backup",
    "Real-time collaboration",
    "Mobile-responsive design"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-primary" />
              <span className="text-xl sm:text-2xl font-bold">AkraLegal</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/demo')}>
                Demo
              </Button>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              <Button variant="ghost" className="w-full" onClick={() => navigate('/demo')}>
                Demo
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button className="w-full" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Smart Legal Practice
            <span className="block text-primary">Management System</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your legal practice with AI-powered case management, document automation, 
            and intelligent workflow tools designed for modern law firms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="text-lg px-8 w-full sm:w-auto" onClick={() => navigate('/signup')}>
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 w-full sm:w-auto" onClick={() => navigate('/demo')}>
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features for Modern Legal Practice</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your legal practice efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-primary mb-2">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* User Roles Section */}
      <section className="bg-muted/50 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Every Legal Professional</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tailored experiences for different roles in your legal organization
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {userRoles.map((role, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`${role.color} mx-auto mb-4`}>{role.icon}</div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{role.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose AkraLegal?</h2>
            <p className="text-lg text-muted-foreground">
              Transform your legal practice with cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Transform Your Legal Practice?</h2>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of legal professionals who trust AkraLegal for their practice management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 w-full sm:w-auto" onClick={() => navigate('/signup')}>
              Start Your Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary w-full sm:w-auto" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">AkraLegal</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional case management and legal workflow automation for modern law firms.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate('/demo')} className="hover:text-primary">Demo</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-primary">Features</button></li>
                <li><button onClick={() => navigate('/signup')} className="hover:text-primary">Pricing</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-primary">About</button></li>
                <li><button className="hover:text-primary">Contact</button></li>
                <li><button className="hover:text-primary">Support</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-primary">Privacy Policy</button></li>
                <li><button className="hover:text-primary">Terms of Service</button></li>
                <li><button className="hover:text-primary">Security</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} AkraLegal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;