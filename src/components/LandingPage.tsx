import { SignUpButton } from "@clerk/clerk-react";
import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Blocks,
  Calendar,
  Check,
  CheckSquare,
  CirclePlay,
  CreditCard,
  FileText,
  Folder,
  KanbanSquare,
  LayoutDashboard,
  LockKeyhole,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PricingSection from "@/components/ui/pricing-section-1";
import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-columns-1";
import { PRODUCT_EXPERIENCE_PATH } from "../routes";

type LandingPageProps = {
  authEnabled: boolean;
};

const previewNav = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Folder, label: "Projects" },
  { icon: CheckSquare, label: "Tasks" },
  { icon: Calendar, label: "Calendar" },
  { icon: FileText, label: "Reports" },
];

const featureCards = [
  {
    icon: KanbanSquare,
    title: "Project planning",
    description: "Turn ideas into scoped projects with owners, timelines, milestones, and shared priorities.",
  },
  {
    icon: CheckSquare,
    title: "Task ownership",
    description: "Assign work, set due dates, track blockers, and keep every teammate clear on what comes next.",
  },
  {
    icon: BarChart3,
    title: "Live dashboards",
    description: "Monitor project health, team workload, delivery velocity, and task completion in one place.",
  },
  {
    icon: MessageSquare,
    title: "Team collaboration",
    description: "Keep files, comments, status updates, and decisions connected to the work they belong to.",
  },
  {
    icon: Timer,
    title: "Time tracking",
    description: "See where effort is going and compare planned work against actual delivery time.",
  },
  {
    icon: LockKeyhole,
    title: "Secure workspace",
    description: "Protect team data with authenticated access and a clean account experience powered by Clerk.",
  },
];

const workflowSteps = [
  "Capture project goals and scope",
  "Assign owners and deadlines",
  "Track work across tasks and milestones",
  "Review progress with dashboard reporting",
];

const testimonials: Testimonial[] = [
  {
    text: "ProjectHub gave our team one clear place to manage every client project. Status meetings are shorter and handoffs are much cleaner.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop",
    name: "Maya Chen",
    role: "Operations Lead",
  },
  {
    text: "The dashboard helped us spot blockers before deadlines slipped. It feels lightweight, but it gives leadership the visibility we needed.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop",
    name: "Daniel Brooks",
    role: "Head of Delivery",
  },
  {
    text: "Our designers, engineers, and PMs finally work from the same project truth. The workflow is calm and easy to adopt.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
    name: "Avery Morgan",
    role: "Product Manager",
  },
  {
    text: "We migrated from spreadsheets in an afternoon. Task ownership and project progress are now obvious to everyone.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
    name: "Noah Williams",
    role: "Agency Founder",
  },
  {
    text: "The reporting view changed how we run weekly planning. We can compare capacity, active work, and deadlines without digging.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
    name: "Sofia Patel",
    role: "Program Director",
  },
  {
    text: "Clients get faster updates because our internal team is finally aligned. It has made delivery feel much more predictable.",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=256&auto=format&fit=crop",
    name: "Marcus Lee",
    role: "Client Success Lead",
  },
  {
    text: "ProjectHub is simple enough for daily use and polished enough for executive reviews. That balance is rare.",
    image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=256&auto=format&fit=crop",
    name: "Elena Rivera",
    role: "COO",
  },
  {
    text: "The team workload view helped us stop over-assigning the same people. Planning is more honest now.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&auto=format&fit=crop",
    name: "Julian Carter",
    role: "Engineering Manager",
  },
  {
    text: "We love how fast it is to understand what needs attention. The interface gets out of the way and keeps everyone focused.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=256&auto=format&fit=crop",
    name: "Lena Fischer",
    role: "Creative Director",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const viewport = { once: true, margin: "-120px" };

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const cardMotion = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const transition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] };

function DashboardPreview() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-full max-w-[760px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-sky-200/70"
    >
      <div className="flex h-10 items-center justify-between border-b border-slate-100 px-4">
        <div className="flex items-center gap-1.5">
          <div className="flex h-4 w-4 items-center justify-center rounded bg-sky-600">
            <div className="h-2 w-2 rotate-45 rounded-[1px] border border-white" />
          </div>
          <span className="text-[9px] font-bold text-slate-950">ProjectHub</span>
        </div>
        <div className="relative hidden w-52 sm:block">
          <Search className="absolute left-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-slate-400" />
          <div className="h-5 rounded border border-slate-200 bg-slate-50 pl-6 text-[8px] leading-5 text-slate-400">
            Search projects, tasks, or people...
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full border border-slate-400" />
          <span className="h-2 w-2 rounded-full border border-slate-400" />
          <div className="h-6 w-6 rounded-full bg-[url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop')] bg-cover" />
        </div>
      </div>

      <div className="grid grid-cols-[110px_1fr]">
        <aside className="border-r border-slate-100 bg-white p-4">
          <p className="mb-2 text-[8px] font-bold uppercase text-slate-400">Main</p>
          <div className="space-y-1">
            {previewNav.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.35 + index * 0.05 }}
                className={`flex h-6 items-center gap-2 rounded px-2 text-[9px] font-semibold ${
                  item.active ? "bg-sky-50 text-sky-600" : "text-slate-600"
                }`}
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </motion.div>
            ))}
          </div>
          <p className="mb-2 mt-4 text-[8px] font-bold uppercase text-slate-400">Manage</p>
          <div className="space-y-1 text-[9px] font-semibold text-slate-600">
            <div className="flex h-6 items-center gap-2 rounded px-2"><Users className="h-3 w-3" />Team</div>
            <div className="flex h-6 items-center gap-2 rounded px-2"><CreditCard className="h-3 w-3" />Invoices</div>
          </div>
        </aside>

        <div className="bg-white p-5">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-950">Dashboard</h3>
            <p className="text-[10px] text-slate-500">Welcome back, Olivia! Here's what's happening with your projects.</p>
          </div>

          <div className="mb-4 grid grid-cols-4 gap-3">
            {[
              ["Total Projects", "24", "+12%"],
              ["Tasks Completed", "156", "+18%"],
              ["Team Members", "18", "+12"],
              ["Hours Tracked", "532h", "+8%"],
            ].map(([title, value, change]) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[9px] text-slate-500">{title}</p>
                <p className="mt-2 text-lg font-bold text-slate-950">{value}</p>
                <p className="mt-1 text-[8px] text-emerald-500">{change} <span className="text-slate-400">from last month</span></p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[1.2fr_0.85fr] gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-950">Project Progress</p>
                <span className="rounded border border-slate-200 px-2 py-1 text-[8px] text-slate-500">This Month</span>
              </div>
              <div className="relative h-28 overflow-hidden">
                <div className="absolute inset-0 grid grid-rows-4">
                  {[0, 1, 2, 3].map((line) => <span key={line} className="border-t border-slate-100" />)}
                </div>
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 120" fill="none" aria-hidden="true">
                  <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.55, ease: "easeOut" }} d="M10 92 C55 76, 78 76, 104 56 S160 62, 184 42 S238 41, 310 20" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
                  <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }} d="M10 104 C54 88, 83 82, 106 72 S162 75, 188 60 S242 62, 310 38" stroke="#3182f6" strokeWidth="4" strokeLinecap="round" />
                  <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.85, ease: "easeOut" }} d="M10 112 C58 99, 82 96, 110 88 S162 90, 190 78 S244 74, 310 62" stroke="#34c77b" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="mb-2 text-[11px] font-bold text-slate-950">Tasks Overview</p>
              <div className="flex items-center gap-4">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[conic-gradient(#34c77b_0_65%,#3182f6_65%_85%,#d9dde6_85%_100%)]">
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-lg font-bold text-slate-950">156</span>
                    <span className="text-[8px] text-slate-500">Total</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-[9px]">
                  <p className="flex justify-between"><span className="text-slate-600">Completed</span><b>65%</b></p>
                  <p className="flex justify-between"><span className="text-slate-600">In Progress</span><b>20%</b></p>
                  <p className="flex justify-between"><span className="text-slate-600">To Do</span><b>15%</b></p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="mb-2 text-[11px] font-bold">Recent Projects</p>
              {["Website Redesign", "Mobile App Development", "Marketing Campaign"].map((project, index) => (
                <div key={project} className="flex items-center justify-between border-t border-slate-100 py-2 text-[9px]">
                  <span className="font-semibold text-slate-700">{project}</span>
                  <span className="text-sky-600">{index === 2 ? "Planning" : "In Progress"}</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="mb-2 text-[11px] font-bold">My Tasks</p>
              {["Design homepage wireframe", "Review user feedback", "Create marketing plan"].map((task) => (
                <div key={task} className="flex items-center gap-2 border-t border-slate-100 py-2 text-[9px]">
                  <span className="h-2.5 w-2.5 rounded border border-slate-300" />
                  <span className="font-semibold text-slate-700">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      transition={transition}
      className="mx-auto max-w-3xl text-center"
    >
      <p className="mb-3 text-sm font-bold uppercase tracking-wide text-sky-600">{eyebrow}</p>
      <h2 className="font-heading text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{title}</h2>
      <p className="mt-5 text-lg leading-8 text-slate-600">{description}</p>
    </motion.div>
  );
}

function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-background px-6 py-24 lg:px-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-50 to-transparent" />
      <div className="container relative z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-[540px] flex-col items-center justify-center"
        >
          <div className="flex justify-center">
            <div className="rounded-lg border px-4 py-1 text-sm font-semibold text-sky-600">Testimonials</div>
          </div>

          <h2 className="mt-5 text-center text-xl font-bold tracking-tighter text-slate-950 sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
            What our users say
          </h2>
          <p className="mt-5 text-center text-slate-600">
            See how teams use ProjectHub to plan, track, and deliver work with less noise.
          </p>
        </motion.div>

        <div className="mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
}

export function LandingPage({ authEnabled }: LandingPageProps) {
  const primaryCta = (
    <Button className="h-12 rounded-md bg-sky-600 px-8 text-base font-semibold text-white shadow-xl shadow-sky-200 hover:bg-sky-700">
      Get Started Free
    </Button>
  );

  return (
    <div className="bg-white">
      <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_75%_25%,rgba(224,242,254,0.9),transparent_32%),linear-gradient(135deg,#ffffff_0%,#ffffff_56%,#eef0ff_100%)] pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.25 }}
          className="pointer-events-none absolute bottom-0 left-0 h-44 w-full bg-gradient-to-t from-sky-100/80 to-transparent"
        />

        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1440px] items-center gap-12 px-6 py-12 lg:grid-cols-[0.86fr_1.14fr] lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="relative z-10 max-w-2xl"
          >
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.08 }}
              className="font-heading text-5xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl xl:text-7xl"
            >
              The all-in-one platform to manage your <span className="text-sky-500">projects</span> and{" "}
              <span className="text-sky-500">team collaboration</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.18 }}
              className="mt-7 max-w-xl text-lg leading-8 text-slate-600"
            >
              ProjectHub helps teams plan, track, and deliver projects faster — all in one beautiful and intuitive platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.28 }}
              className="mt-9 flex flex-wrap gap-4"
            >
              {authEnabled ? (
                <SignUpButton mode="modal" forceRedirectUrl={PRODUCT_EXPERIENCE_PATH}>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>{primaryCta}</motion.div>
                </SignUpButton>
              ) : (
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>{primaryCta}</motion.div>
              )}
              <a href={PRODUCT_EXPERIENCE_PATH}>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="h-12 rounded-md border-slate-200 bg-white px-8 text-base font-semibold text-slate-950 shadow-sm hover:bg-slate-50">
                    <CirclePlay className="h-5 w-5 text-sky-600" />
                    Book a Demo
                  </Button>
                </motion.div>
              </a>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mt-14 flex flex-wrap gap-x-10 gap-y-4 text-sm font-medium text-slate-700"
            >
              {[
                { icon: CreditCard, label: "No credit card required" },
                { icon: ShieldCheck, label: "14-day free trial" },
                { icon: RefreshCw, label: "Cancel anytime" },
              ].map((item) => (
                <motion.span key={item.label} variants={fadeUp} transition={transition} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-sky-600" />
                  {item.label}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 34 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative z-10 hidden justify-end lg:flex"
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </section>

      <motion.section
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        transition={transition}
        className="border-y border-slate-100 bg-white py-8"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-14 gap-y-5 px-6 text-sm font-bold text-slate-400 lg:px-12"
        >
          {["Northstar Studio", "BrightLayer", "Orbit Labs", "SummitOps", "Nexa Works"].map((company) => (
            <motion.span key={company} variants={fadeUp} transition={transition}>{company}</motion.span>
          ))}
        </motion.div>
      </motion.section>

      <section id="features" className="bg-white px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <SectionHeading
            eyebrow="Features"
            title="Everything your team needs to deliver work with confidence"
            description="ProjectHub brings planning, collaboration, reporting, and accountability into one calm workspace built for repeat daily use."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {featureCards.map((feature) => (
              <motion.div
                key={feature.title}
                variants={cardMotion}
                transition={transition}
                whileHover={{ y: -6, scale: 1.01 }}
                className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm shadow-slate-100 transition-shadow hover:shadow-xl hover:shadow-sky-100/70"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-950">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="solutions" className="bg-slate-50 px-6 py-24 lg:px-12">
        <div className="mx-auto grid max-w-[1440px] items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            transition={transition}
          >
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-sky-600">Workflow</p>
            <h2 className="font-heading text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Move from scattered updates to one shared operating rhythm
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Give every project a single home for scope, owners, files, status, deadlines, and reporting. Teams can see the work, understand tradeoffs, and act faster.
            </p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              className="mt-8 space-y-4"
            >
              {workflowSteps.map((step) => (
                <motion.div key={step} variants={cardMotion} transition={transition} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-white">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="font-semibold text-slate-800">{step}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={cardMotion}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            transition={transition}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/70"
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              className="grid gap-4 md:grid-cols-2"
            >
              <motion.div variants={cardMotion} transition={transition} whileHover={{ y: -5 }} className="rounded-lg bg-sky-600 p-7 text-white">
                <Sparkles className="mb-12 h-7 w-7" />
                <p className="text-5xl font-bold">42%</p>
                <p className="mt-3 text-sky-100">faster handoffs between teams</p>
              </motion.div>
              <motion.div variants={cardMotion} transition={transition} whileHover={{ y: -5 }} className="rounded-lg border border-slate-200 p-7">
                <Bell className="mb-12 h-7 w-7 text-sky-600" />
                <p className="text-5xl font-bold text-slate-950">3.8x</p>
                <p className="mt-3 text-slate-600">more visibility into project blockers</p>
              </motion.div>
              <motion.div variants={cardMotion} transition={transition} whileHover={{ y: -5 }} className="rounded-lg border border-slate-200 p-7">
                <Workflow className="mb-12 h-7 w-7 text-sky-600" />
                <p className="text-5xl font-bold text-slate-950">156</p>
                <p className="mt-3 text-slate-600">tasks tracked in a single workspace</p>
              </motion.div>
              <motion.div variants={cardMotion} transition={transition} whileHover={{ y: -5 }} className="rounded-lg bg-slate-950 p-7 text-white">
                <Blocks className="mb-12 h-7 w-7" />
                <p className="text-5xl font-bold">18</p>
                <p className="mt-3 text-slate-300">team members aligned daily</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <PricingSection />

      <section id="resources" className="bg-slate-50 px-6 py-24 lg:px-12">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[1fr_1fr]">
          <motion.div
            variants={cardMotion}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            transition={transition}
            className="rounded-xl border border-slate-200 bg-white p-8"
          >
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-sky-600">Resources</p>
            <h2 className="font-heading text-4xl font-bold tracking-tight text-slate-950">Guides for better project delivery</h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              className="mt-8 space-y-4"
            >
              {["How to build a project operating rhythm", "A practical guide to workload planning", "Reporting templates for client-facing teams"].map((resource) => (
                <motion.a key={resource} variants={cardMotion} transition={transition} whileHover={{ x: 4 }} href="#" className="flex items-center justify-between rounded-lg border border-slate-200 p-5 font-semibold text-slate-800 hover:border-sky-200 hover:bg-sky-50">
                  {resource}
                  <ArrowRight className="h-4 w-4 text-sky-600" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            id="company"
            variants={cardMotion}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            transition={{ ...transition, delay: 0.08 }}
            className="rounded-xl bg-slate-950 p-8 text-white"
          >
            <p className="mb-10 text-sm font-bold uppercase tracking-wide text-sky-300">Customer Story</p>
            <blockquote className="font-heading text-3xl font-bold leading-tight">
              “ProjectHub gave our team one clean view of every project. We stopped chasing updates and started shipping with focus.”
            </blockquote>
            <div className="mt-10 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-sky-500" />
              <div>
                <p className="font-bold">Maya Chen</p>
                <p className="text-sm text-slate-400">Operations Lead, BrightLayer</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <TestimonialsSection />

      <section className="bg-white px-6 py-24 lg:px-12">
        <motion.div
          variants={cardMotion}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          transition={transition}
          className="mx-auto flex max-w-[1440px] flex-col items-center rounded-xl bg-sky-600 px-8 py-16 text-center text-white"
        >
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">Ready to bring every project into focus?</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-sky-100">
            Start with a focused workspace your team can understand in minutes and use every day.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            {authEnabled ? (
              <SignUpButton mode="modal" forceRedirectUrl={PRODUCT_EXPERIENCE_PATH}>
                <Button className="h-12 rounded-md bg-white px-8 text-base font-semibold text-sky-600 hover:bg-sky-50">
                  Get Started Free
                </Button>
              </SignUpButton>
            ) : (
              <Button className="h-12 rounded-md bg-white px-8 text-base font-semibold text-sky-600 hover:bg-sky-50">
                Get Started Free
              </Button>
            )}
            <a href={PRODUCT_EXPERIENCE_PATH}>
              <Button variant="outline" className="h-12 rounded-md border-white/30 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10">
                View Dashboard
              </Button>
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
