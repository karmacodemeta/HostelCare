import Link from 'next/link';
import { 
  Sparkles, Compass, ShieldCheck, ArrowRight, 
  CreditCard, Calendar, Users, MapPin, 
  TrendingUp, FileText, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Home() {
  const features = [
    {
      title: "Interactive PG Explorer Maps",
      description: "Discover premium student housing and PGs in Noida and Patna. Filter by AC, gym access, or High-Speed WiFi and view starting rents directly on interactive price pins.",
      icon: <Compass className="w-6 h-6 text-indigo-500" />
    },
    {
      title: "Secure KYC Validation",
      description: "Complete your tenant identity verification instantly. Securely upload Aadhaar and PAN documents to comply with local student accommodation regulations.",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />
    },
    {
      title: "Digitally Signed Lease Contracts",
      description: "Digitally sign legally protective residential license agreements from owner to student, fully safeguarding all parties with automated platform waivers.",
      icon: <FileText className="w-6 h-6 text-indigo-500" />
    },
    {
      title: "Simulated Razorpay Gateway Checkout",
      description: "Clear your rent or advance security deposits online using UPI, Credit Cards, or Net Banking, with instant dynamic receipts generated in real-time.",
      icon: <CreditCard className="w-6 h-6 text-amber-500" />
    },
    {
      title: "Dynamic Leaves & Gatepass board",
      description: "Apply for hostel check-outs and leaves through interactive student calendars and track real-time approval permissions from your Warden panel.",
      icon: <Calendar className="w-6 h-6 text-violet-500" />
    },
    {
      title: "Warden Security & Visitor Ledgers",
      description: "Log active guests at the main gate, manage bed vacancy grid layouts, and visualize comparative branch profits and monthly historic occupancy trends.",
      icon: <TrendingUp className="w-6 h-6 text-rose-500" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-350 text-zinc-900 dark:text-zinc-100">
      
      {/* Dynamic Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
              HostelCare
            </span>
          </div>

          {/* Navigation Links in human readable language */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-zinc-650 dark:text-zinc-300">
            <Link href="/student/explore" className="hover:text-indigo-600 dark:hover:text-indigo-450 transition-colors">
              Explore PGs & Rooms
            </Link>
            <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-450 transition-colors">
              Resident Login
            </Link>
            <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-450 transition-colors">
              Admin & Warden Portal
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/student/explore" 
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm cursor-pointer"
            >
              Book Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 flex-1 flex flex-col justify-center">
        {/* Sleek background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.04] dark:opacity-[0.02] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/5 dark:to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-100 dark:border-zinc-800 bg-indigo-50/20 dark:bg-zinc-900/40 text-[10px] uppercase tracking-widest font-extrabold text-indigo-650 dark:text-indigo-450">
            <Sparkles className="w-3 h-3" /> Fully Production-Ready Enterprise SaaS
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.1] max-w-4xl mx-auto">
            Premium Student Housing <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              Managed Simply.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
            HostelCare is the modern PG and Hostel management platform that handles everything from interactive map bookings, digital KYC verifications, and protective lease agreements to automated online checkout.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link 
              href="/student/explore" 
              className="px-6 py-3.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              Explore Local PGs <Compass className="w-4 h-4 animate-pulse" />
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-3.5 rounded-xl font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-1.5 cursor-pointer bg-white dark:bg-zinc-950"
            >
              Sign In <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Showcase Grid */}
      <section className="py-20 bg-zinc-100/40 dark:bg-zinc-900/10 border-t border-zinc-200/50 dark:border-zinc-800/40">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Built For Professional PG Operators & Residents</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">Complete end-to-end multi-tenant workflows that eliminate administrative overhead.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl border border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-300"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950/30 border dark:border-zinc-800 flex items-center justify-center shadow-inner">
                    {f.icon}
                  </div>
                  <h3 className="font-extrabold text-base text-zinc-850 dark:text-zinc-100">{f.title}</h3>
                  <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beautiful Public Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-auto py-10 px-6">
        <div className="max-w-7xl mx-auto grid gap-8 sm:grid-cols-2 md:grid-cols-4 text-xs">
          
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-extrabold text-base text-zinc-900 dark:text-white">HostelCare</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-450 leading-relaxed max-w-[200px]">
              Modern, secure student housing and multi-branch management platform.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Public Services</h4>
            <ul className="space-y-2 font-medium text-zinc-650 dark:text-zinc-350">
              <li>
                <Link href="/student/explore" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Explore Noida Branches</Link>
              </li>
              <li>
                <Link href="/student/explore" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Explore Patna Branches</Link>
              </li>
              <li>
                <Link href="/student/explore" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Explore Available Rooms</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Access Channels</h4>
            <ul className="space-y-2 font-medium text-zinc-650 dark:text-zinc-350">
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Student Login</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Warden Admin Portal</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Legal Compliance</h4>
            <ul className="space-y-2 font-medium text-zinc-650 dark:text-zinc-350">
              <li>
                <span className="text-zinc-500 block">✓ Tenant KYC Audited</span>
              </li>
              <li>
                <span className="text-zinc-500 block">✓ Digital Leases Verified</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Developed by Karma Code signature row */}
        <div className="max-w-7xl mx-auto border-t border-zinc-200 dark:border-zinc-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
          <p>© 2026 HostelCare. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Developed & Powered by</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Karma Code</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
