import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ModeToggle } from "./components/ui/ModeToggle.tsx";
import { Button } from "./components/ui/Button.tsx";
import { cn } from "@/lib/utils";
import AnalyticsPage from "./pages/analytics/AnalyticsPage.tsx";
import {
  Card,
  CardContent,
  CardDescription,
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
  Rocket,
  Target,
  FileSpreadsheet,
  Brain,
  LogOut,
  Menu,
  X,
  Package,
} from "lucide-react";
import "./globals.css";

const tabs = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: BarChart3,
    color: "violet",
    path: "dashboard",
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: TrendingUp,
    color: "teal",
    path: "analytics",
  },
  {
    id: "clients",
    name: "Clients",
    icon: Users,
    color: "coral",
    path: "clients",
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: Calendar,
    color: "emerald",
    path: "calendar",
  },
  {
    id: "settings",
    name: "Settings",
    icon: Settings,
    color: "violet",
    path: "settings",
  },
  {
    id: "orders",
    name: "Orders",
    icon: Package,
    color: "red",
    path: "orders",
  },
] as const;

type TabDefinition = (typeof tabs)[number];

type AccentColor = TabDefinition["color"];

const tabGradients: Record<AccentColor, string> = {
  violet: "from-violet-500 via-violet-600 to-violet-700",
  teal: "from-teal-500 via-teal-600 to-teal-700",
  coral: "from-coral-500 via-coral-600 to-coral-700",
  emerald: "from-emerald-500 via-emerald-600 to-emerald-700",
  red: "from-red-500 via-red-600 to-red-700",
};

const tabSoftBackground: Record<AccentColor, string> = {
  violet: "hover:bg-violet-500/10 dark:hover:bg-violet-500/20",
  teal: "hover:bg-teal-500/10 dark:hover:bg-teal-500/20",
  coral: "hover:bg-coral-500/10 dark:hover:bg-coral-500/20",
  emerald: "hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20",
  red: "hover:bg-red-500/10 dark:hover:bg-red-500/20",
};

function ResponsiveSidebar({
  tabs,
  isOpen,
  onToggle,
  onClose,
}: {
  tabs: readonly TabDefinition[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { logout } = useAuth();

  return (
    <>
      {/* Hamburger for md and below */}
      <div className="fixed top-0 left-0 w-full bg-white/95 dark:bg-slate-950/95 text-slate-800 dark:text-slate-100 flex items-center justify-between px-6 py-3 z-40 lg:hidden border-b border-slate-200/70 dark:border-slate-800/70 shadow-sm backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-teal-500 flex items-center justify-center shadow-lg">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-lg gradient-text tracking-wide select-none">
            Ads Analytics
          </span>
        </div>
        <button
          onClick={onToggle}
          className="text-3xl text-slate-700 dark:text-slate-100 rounded-lg p-1 transition hover:bg-slate-200/70 dark:hover:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950"
          aria-label="Toggle menu"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } lg:hidden`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white/90 text-slate-800 dark:bg-slate-950/90 dark:text-slate-100 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 shadow-2xl p-6 flex flex-col justify-between transition-transform z-40
        ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:block`}
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
            onClick={onClose}
            className="text-3xl text-slate-700 dark:text-slate-100 rounded-full p-1 transition hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950"
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        {/* Welcome text */}
        <div className="space-y-6">
          <p className="text-base font-semibold text-slate-600 dark:text-slate-400">
            Welcome back
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-4 mt-8 flex-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              end={tab.path === "dashboard"}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-5 py-3 text-base font-semibold transition-colors duration-200 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400 focus-visible:ring-offset-white dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950",
                  isActive
                    ? `bg-gradient-to-r ${
                        tabGradients[tab.color]
                      } text-white shadow-lg ring-1 ring-white/40 dark:ring-white/10`
                    : tabSoftBackground[tab.color]
                )
              }
              onClick={onClose}
            >
              {({ isActive }) => (
                <>
                  <tab.icon
                    className={cn(
                      "h-6 w-6 transition-colors duration-200",
                      isActive
                        ? "text-white"
                        : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-100"
                    )}
                  />
                  <span className="select-none">{tab.name}</span>
                </>
              )}
            </NavLink>
          ))}
          <div className="mt-auto space-y-4 pt-10">
            <ModeToggle />
            <button
              type="button"
              onClick={logout}
              className="group relative w-full overflow-hidden rounded-xl border border-white/20 bg-black px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
                <span>Logout</span>
              </span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}

function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 dark:from-slate-950 dark:via-blue-950 dark:to-violet-950">
      <ResponsiveSidebar
        tabs={tabs}
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
        onClose={() => setIsOpen(false)}
      />

      <main className="flex-1 lg:ml-30 p-6 md:p-8">
        <div className="space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const status = {
  frontend: "Running on port 3000",
  api: "Running on port 8000",
  processor: "Running on port 5001",
};

const platformFeatures = [
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

function DashboardHome() {
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
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span>Data Processor</span>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
        <Card className="p-6 border-2 border-dashed border-violet-200 dark:border-violet-800 bg-white/70 dark:bg-slate-900/70 hover:shadow-lg transition-all">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-semibold text-violet-700 dark:text-violet-200">
              Campaign Performance
            </CardTitle>
            <CardDescription>
              Analyze key advertising metrics like ROAS, CPA, CTR, and
              conversion value to optimize campaign spending.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="p-6 border-2 border-dashed border-teal-200 dark:border-teal-800 bg-white/70 dark:bg-slate-900/70 hover:shadow-lg transition-all">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-semibold text-teal-700 dark:text-teal-200">
              Monthly Comparisons
            </CardTitle>
            <CardDescription>
              Compare month-over-month performance with automated variance
              analysis and highlight trends effortlessly.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="p-6 border-2 border-dashed border-rose-200 dark:border-rose-800 bg-white/70 dark:bg-slate-900/70 hover:shadow-lg transition-all">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-semibold text-rose-700 dark:text-rose-200">
              Team Collaboration
            </CardTitle>
            <CardDescription>
              Share dashboards with clients and stakeholders with role-based
              permissions and instant updates.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center gradient-text">
          Platform Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformFeatures.map((feature, index) => {
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
}

function AnalyticsRoute() {
  return (
    <>
      <AnalyticsPage />
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
    </>
  );
}

function UnderConstruction({ section }: { section: string }) {
  return (
    <div className="text-center space-y-8 my-12 lg:my-0">
      <div className="space-y-4">
        <h2 className="text-4xl font-bold gradient-text capitalize">
          {section}
        </h2>
        <p className="text-lg text-muted-foreground">
          This {section} section is under development
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
            The platform infrastructure is ready! This feature will be available
            in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function App() {
  return <DashboardLayout />;
}

export { DashboardHome, AnalyticsRoute, UnderConstruction };

export default App;
