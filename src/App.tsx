import React, { useState } from "react";
import { ModeToggle } from "./components/ui/ModeToggle.tsx";
import { Button } from "./components/ui/Button.tsx";
import { Input } from "./components/ui/Input.tsx";
import { Label } from "./components/ui/Label.tsx";
import CalendarPage from "@/pages/calendar/CalendarPage.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/Card.tsx";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Settings,
  Upload,
  CheckCircle2,
  Zap,
  Shield,
  Smartphone,
  Sparkles,
  Rocket,
  Target,
  FileSpreadsheet,
  Brain,
  Menu,
  X,
} from "lucide-react";
import "./globals.css";
import { ClientsPage } from "./pages/clients/ClientsPage.tsx";

function LoginForm() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      credentials.email === "admin@agency.com" &&
      credentials.password === "password"
    ) {
      setIsLoggedIn(true);
    } else {
      alert("Invalid credentials. Use: admin@agency.com / password");
    }
  };

  if (isLoggedIn) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-teal-50 to-coral-50 dark:from-violet-950 dark:via-teal-950 dark:to-coral-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-aurora opacity-30 animate-pulse"></div>
      <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-white/20 shadow-2xl animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-violet-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold gradient-text">
            Ads Analytics Platform
          </CardTitle>
          <CardDescription className="text-base">
            Welcome back! Sign in to your analytics dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                className="h-12 bg-white/80 dark:bg-slate-800/80 border-2 border-violet-200 dark:border-violet-800 focus:border-violet-500 dark:focus:border-violet-400 rounded-lg"
                placeholder="admin@agency.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                className="h-12 bg-white/80 dark:bg-slate-800/80 border-2 border-violet-200 dark:border-violet-800 focus:border-violet-500 dark:focus:border-violet-400 rounded-lg"
                placeholder="password"
              />
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="xl"
              className="w-full font-semibold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Sign In to Dashboard
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <Card className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-4">
              <p className="text-sm text-center text-emerald-700 dark:text-emerald-300 font-medium">
                <Shield className="inline w-4 h-4 mr-1" />
                Demo Credentials
              </p>
              <div className="text-xs text-center space-y-1 mt-2 text-emerald-600 dark:text-emerald-400">
                <p>
                  <strong>Email:</strong> admin@agency.com
                </p>
                <p>
                  <strong>Password:</strong> password
                </p>
              </div>
            </CardContent>
          </Card>
        </CardFooter>
      </Card>
    </div>
  );
}

function ResponsiveSidebar({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: { id: string; name: string; icon: React.ElementType; color: string }[];
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger for md and below */}
      <div className="fixed top-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 flex items-center justify-between px-6 py-3 z-40 lg:hidden border-b border-white/20 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-teal-500 flex items-center justify-center shadow-lg">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-lg gradient-text tracking-wide select-none">
            Ads Analytics
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-3xl text-slate-700 dark:text-white focus:outline-none rounded-lg p-1 hover:bg-accent transition"
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        } lg:hidden`}
        onClick={() => setOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 border-r border-white/20 shadow-lg p-6 flex flex-col justify-between transition-transform z-40
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:block`}
        style={{ transitionProperty: "transform" }}
      >
        {/* Logo & close button */}
        <div className="flex items-center justify-between mb-10 lg:hidden">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-teal-500 rounded-xl flex items-center justify-center shadow-xl">
              <Rocket className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold gradient-text tracking-wide select-none">
              Ads Analytics
            </h1>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-3xl text-slate-700 dark:text-white hover:text-foreground focus:outline-none rounded-full p-1 transition"
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        {/* Welcome text */}
        <div className="space-y-6">
          <p className="text-base font-semibold text-muted-foreground">
            Welcome back, Admin
          </p>
          <p className="text-sm text-muted-foreground">
            Last login: Today, 9:30 AM
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-4 mt-8 h-screen">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setOpen(false);
                }}
                className={`flex items-center space-x-3 py-3 px-5 rounded-xl font-semibold text-base transition-transform duration-300
                  ${
                    isActive
                      ? `bg-gradient-to-r from-${tab.color}-400 to-${tab.color}-600 text-green-600 shadow-lg`
                      : "text-muted-foreground hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                style={{ transitionProperty: "background-color, transform" }}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive
                      ? "text-green-600"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <span className="select-none">{tab.name}</span>
              </button>
            );
          })}
          <div className="mt-auto pt-10">
            <ModeToggle />
          </div>
        </nav>
      </aside>
    </>
  );
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: BarChart3, color: "violet" },
    { id: "analytics", name: "Analytics", icon: TrendingUp, color: "teal" },
    { id: "clients", name: "Clients", icon: Users, color: "coral" },
    { id: "calendar", name: "Calendar", icon: Calendar, color: "emerald" },
    { id: "settings", name: "Settings", icon: Settings, color: "violet" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 dark:from-slate-950 dark:via-blue-950 dark:to-violet-950">
      {/* Sidebar */}
      <ResponsiveSidebar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 md:p-8">
        <div className="space-y-8">
          <TabContent activeTab={activeTab} />
        </div>
      </main>
    </div>
  );
}

function TabContent({ activeTab }: { activeTab: string }) {
  const status = {
    frontend: "Running on port 3000",
    api: "Running on port 8000",
    processor: "Running on port 5001",
  };

  const features = [
    {
      icon: FileSpreadsheet,
      title: "File Upload & Processing",
      description: "CSV/Excel from Meta & Google Ads",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "AI-powered Insights",
      description: "Smart recommendations and predictions",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Data Quality Validation",
      description: "15+ validation rules for accuracy",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Calendar,
      title: "Social Media Calendar",
      description: "Automated scheduling and management",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Users,
      title: "Multi-client Support",
      description: "Role-based access control",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: Smartphone,
      title: "Responsive Design",
      description: "Modern UI with dark/light themes",
      color: "from-pink-500 to-rose-500",
    },
  ];

  switch (activeTab) {
    case "dashboard":
      return (
        <div className="space-y-8 my-12 lg:my-0">
          <div className="text-center space-y-4 animate-slide-up">
            <h2 className="text-4xl font-bold gradient-text">
              Analytics Dashboard
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Monitor your advertising performance with real-time insights and
              AI-powered analytics
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-3 text-blue-800 dark:text-blue-200">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span>React Frontend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    {status.frontend}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-3 text-emerald-800 dark:text-emerald-200">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <span>Laravel API</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                    {status.api}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-3 text-purple-800 dark:text-purple-200">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span>Python Processor</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-purple-700 dark:text-purple-300 font-medium">
                    {status.processor}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center gradient-text">
              Platform Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    className="group hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in border-2"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader>
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      );

    case "analytics":
      return (
        <div className="space-y-8 my-12 lg:my-0">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold gradient-text">Analytics Hub</h2>
            <p className="text-lg text-muted-foreground">
              Upload your advertising data to unlock powerful insights
            </p>
          </div>

          <Card className="max-w-4xl mx-auto border-dashed border-2 border-teal-300 dark:border-teal-700 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950">
            <CardContent className="p-12 text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-teal-800 dark:text-teal-200">
                  Drop Files Here
                </h3>
                <p className="text-teal-600 dark:text-teal-400">
                  or click to browse your computer
                </p>
              </div>
              <div className="text-sm text-teal-500 dark:text-teal-400 space-y-1">
                <p>Supports CSV, Excel files from:</p>
                <div className="flex justify-center space-x-6 mt-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    Meta Ads
                  </span>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                    Google Ads
                  </span>
                </div>
              </div>
              <Button variant="gradient" size="lg" className="mt-4">
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                Choose Files
              </Button>
            </CardContent>
          </Card>
        </div>
      );

    case "calendar":
      return <CalendarPage></CalendarPage>;

      case "clients":
        return <ClientsPage/>

    default :
      return (
        <div className="text-center space-y-8 my-12 lg:my-0">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold gradient-text capitalize">
              {activeTab}
            </h2>
            <p className="text-lg text-muted-foreground">
              This {activeTab} section is under development
            </p>
          </div>

          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 dark:border-orange-800">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-200">
                Coming Soon
              </h3>
              <p className="text-orange-600 dark:text-orange-400">
                The platform infrastructure is ready! This feature will be
                available in the next update.
              </p>
            </CardContent>
          </Card>
        </div>
      );
  }
}

function App() {
  return <LoginForm />;
}

export default App;
