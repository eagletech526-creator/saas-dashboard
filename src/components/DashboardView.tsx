import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bell,
  Briefcase,
  Calendar,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  Clock,
  CreditCard,
  Facebook,
  File,
  FileText,
  Folder,
  Github,
  Inbox,
  LayoutDashboard,
  Linkedin,
  Loader2,
  Mail,
  Menu,
  MessageSquare,
  MoreVertical,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Timer,
  Twitter,
  Upload,
  UserPlus,
  Users,
  Users2,
  X,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PRODUCT_EXPERIENCE_PATH } from "../routes";

type ViewKey =
  | "Dashboard"
  | "AI Assistant"
  | "Projects"
  | "Tasks"
  | "Calendar"
  | "Time Tracking"
  | "Reports"
  | "Team"
  | "Clients"
  | "Invoices"
  | "Files"
  | "Settings"
  | "Integrations"
  | "Billing";

type ProjectStatus = "Planning" | "In Progress" | "On Hold" | "Completed";
type TaskStatus = "To Do" | "In Progress" | "Completed";
type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue";
type TeamMemberStatus = "Active" | "Invited";
type TeamMemberRole = "Admin" | "Manager" | "Member" | "Viewer";

type Project = {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string;
  color: string;
  icon: "zap" | "briefcase" | "message" | "clock" | "inbox";
};

type Task = {
  id: string;
  title: string;
  projectId: string;
  status: TaskStatus;
  dueDate: string;
  assignee: string;
  hours: number;
};

type Invoice = {
  id: string;
  number: string;
  client: string;
  projectId: string;
  status: InvoiceStatus;
  amount: number;
  issueDate: string;
  dueDate: string;
};

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  joinedAt: string;
};

type DashboardUser = {
  clerkId?: string;
  name: string;
  firstName: string;
  email: string;
  initials: string;
  imageUrl: string;
  role: string;
};

type AiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ToastMessage = {
  id: string;
  title: string;
  description?: string;
};

type ClientRecord = {
  id: string;
  name: string;
  contact: string;
  projects: number;
};

type FileRecord = {
  id: string;
  name: string;
  project: string;
  uploadedAt: string;
};

type IntegrationRecord = {
  id: string;
  name: string;
  status: "Connected" | "Available";
};

type ReportRecord = {
  id: string;
  name: string;
  createdAt: string;
};

const demoUser: DashboardUser = {
  name: "Olivia Rhye",
  firstName: "Olivia",
  email: "olivia@projecthub.com",
  initials: "OR",
  imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop",
  role: "Admin",
};

const projectIcons = {
  zap: Zap,
  briefcase: Briefcase,
  message: MessageSquare,
  clock: Clock,
  inbox: Inbox,
};

const projectColorClasses = {
  indigo: { text: "text-sky-600", bg: "bg-sky-50", bar: "bg-sky-600" },
  blue: { text: "text-blue-600", bg: "bg-blue-50", bar: "bg-blue-500" },
  emerald: { text: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-500" },
  violet: { text: "text-violet-600", bg: "bg-violet-50", bar: "bg-violet-500" },
  orange: { text: "text-orange-500", bg: "bg-orange-50", bar: "bg-orange-500" },
} as const;

const mainNav = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Sparkles, label: "AI Assistant" },
  { icon: Folder, label: "Projects" },
  { icon: CheckSquare, label: "Tasks" },
  { icon: Calendar, label: "Calendar" },
  { icon: Clock, label: "Time Tracking" },
  { icon: FileText, label: "Reports" },
] satisfies Array<{ icon: typeof LayoutDashboard; label: ViewKey }>;

const manageNav = [
  { icon: Users2, label: "Team" },
  { icon: Users, label: "Clients" },
  { icon: CreditCard, label: "Invoices" },
  { icon: File, label: "Files" },
] satisfies Array<{ icon: typeof LayoutDashboard; label: ViewKey }>;

const settingsNav = [
  { icon: Settings, label: "Settings" },
  { icon: ShieldCheck, label: "Integrations" },
  { icon: CreditCard, label: "Billing" },
] satisfies Array<{ icon: typeof LayoutDashboard; label: ViewKey }>;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function daysUntil(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${value}T00:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function dueLabel(value: string) {
  const days = daysUntil(value);
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  return `Due in ${days} day${days === 1 ? "" : "s"}`;
}

function ToastViewport({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div className="fixed right-4 top-4 z-[80] grid w-[min(92vw,360px)] gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
          <p className="text-sm font-bold text-slate-950">{toast.title}</p>
          {toast.description && <p className="mt-1 text-sm leading-5 text-slate-600">{toast.description}</p>}
        </div>
      ))}
    </div>
  );
}

function createId() {
  return crypto.randomUUID();
}

function getDashboardQuery(user: DashboardUser) {
  const params = new URLSearchParams({
    name: user.name,
    firstName: user.firstName,
    email: user.email || "guest@projecthub.local",
    role: user.role,
  });

  if (user.clerkId) params.set("clerkId", user.clerkId);
  if (user.imageUrl) params.set("imageUrl", user.imageUrl);

  return params.toString();
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-600 text-white shadow-sm">
        <div className="h-3.5 w-3.5 rotate-45 rounded-[3px] border-2 border-white/90" />
      </div>
      {!compact && <span className="font-heading text-lg font-bold text-slate-950">ProjectHub</span>}
    </div>
  );
}

function UserAccountControl({
  authEnabled,
  user,
  size = "md",
}: {
  authEnabled: boolean;
  user: DashboardUser;
  size?: "sm" | "md";
}) {
  if (authEnabled) {
    return (
      <>
        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: size === "sm" ? "h-9 w-9" : "h-10 w-10",
              },
            }}
          />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal" forceRedirectUrl={PRODUCT_EXPERIENCE_PATH}>
            <Button className="h-9 rounded-md bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700">
              Log in
            </Button>
          </SignInButton>
        </SignedOut>
      </>
    );
  }

  return (
    <Avatar className={size === "sm" ? "h-9 w-9" : "h-10 w-10"}>
      <AvatarImage src={user.imageUrl} />
      <AvatarFallback>{user.initials}</AvatarFallback>
    </Avatar>
  );
}

function SidebarGroup({
  title,
  items,
  activeView,
  onSelect,
}: {
  title: string;
  items: Array<{ icon: typeof LayoutDashboard; label: ViewKey }>;
  activeView: ViewKey;
  onSelect: (view: ViewKey) => void;
}) {
  return (
    <div>
      <p className="mb-3 px-2 text-[11px] font-semibold uppercase text-slate-500">{title}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => onSelect(item.label)}
            className={`flex h-9 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition ${
              activeView === item.label ? "bg-sky-50 text-sky-600" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DashboardFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-8 py-5 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
        <span>© 2026 ProjectHub. All rights reserved.</span>
        <div className="flex gap-8">
          <a href="#" className="hover:text-sky-600">Privacy Policy</a>
          <a href="#" className="hover:text-sky-600">Terms of Service</a>
          <a href="#" className="hover:text-sky-600">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-none">
      <CardContent className="flex min-h-60 flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
          <Folder className="h-6 w-6" />
        </div>
        <h3 className="font-heading text-xl font-bold text-slate-950">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}

function ProjectForm({
  onCreate,
}: {
  onCreate: (project: Omit<Project, "id" | "progress" | "color" | "icon">) => void;
}) {
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [dueDate, setDueDate] = useState("2026-06-20");
  const [status, setStatus] = useState<ProjectStatus>("Planning");

  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-950">New Project</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-[1.1fr_1fr_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            onCreate({ name, client: client || "Internal", dueDate, status });
            setName("");
            setClient("");
            setStatus("Planning");
          }}
        >
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Project name" className="h-10 border-slate-200 bg-white" />
          <Input value={client} onChange={(event) => setClient(event.target.value)} placeholder="Client or scope" className="h-10 border-slate-200 bg-white" />
          <select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option>Planning</option>
            <option>In Progress</option>
            <option>On Hold</option>
            <option>Completed</option>
          </select>
          <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="h-10 border-slate-200 bg-white" />
          <Button className="h-10 bg-sky-600 text-white hover:bg-sky-700 md:col-span-4">
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TaskForm({
  projects,
  user,
  onCreate,
}: {
  projects: Project[];
  user: DashboardUser;
  onCreate: (task: Omit<Task, "id" | "status">) => void;
}) {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [dueDate, setDueDate] = useState("2026-06-12");
  const [hours, setHours] = useState(2);

  useEffect(() => {
    if (projectId && !projects.some((project) => project.id === projectId)) {
      setProjectId("");
    }
  }, [projectId, projects]);

  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-950">New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-[1.2fr_1fr_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) return;
            onCreate({ title: title.trim(), projectId, dueDate, assignee: user.name, hours });
            setTitle("");
          }}
        >
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title" className="h-10 border-slate-200 bg-white text-field-foreground placeholder:text-field-placeholder" />
          <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-field-foreground">
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="h-10 border-slate-200 bg-white text-field-foreground" />
          <Input type="number" min={1} value={hours} onChange={(event) => setHours(Math.max(1, Number(event.target.value) || 1))} className="h-10 border-slate-200 bg-white text-field-foreground" />
          <Button className="h-10 bg-sky-600 text-white hover:bg-sky-700 md:col-span-4">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function InvoiceForm({
  projects,
  onCreate,
}: {
  projects: Project[];
  onCreate: (invoice: Omit<Invoice, "id" | "number" | "status">) => void;
}) {
  const [client, setClient] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [amount, setAmount] = useState(2500);
  const [issueDate, setIssueDate] = useState("2026-05-27");
  const [dueDate, setDueDate] = useState("2026-06-10");

  useEffect(() => {
    if (!projectId && projects[0]) setProjectId(projects[0].id);
  }, [projectId, projects]);

  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-950">New Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            if (!client.trim() || !projectId || amount <= 0) return;
            onCreate({ client, projectId, amount, issueDate, dueDate });
            setClient("");
            setAmount(2500);
          }}
        >
          <Input value={client} onChange={(event) => setClient(event.target.value)} placeholder="Client name" className="h-10 border-slate-200 bg-white" />
          <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <Input type="number" min={1} value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="h-10 border-slate-200 bg-white" />
          <Input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} className="h-10 border-slate-200 bg-white" />
          <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="h-10 border-slate-200 bg-white" />
          <Button className="h-10 bg-sky-600 text-white hover:bg-sky-700 md:col-span-5">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TeamMemberForm({
  onInvite,
}: {
  onInvite: (member: Pick<TeamMember, "email" | "role">) => boolean;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMemberRole>("Member");
  const [message, setMessage] = useState("");

  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-950">Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-[1fr_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            const normalizedEmail = email.trim().toLowerCase();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
              setMessage("Enter a valid email address.");
              return;
            }
            const created = onInvite({ email: normalizedEmail, role });
            setMessage(created ? "Invitation added to the workspace." : "That email is already on the team.");
            if (created) {
              setEmail("");
              setRole("Member");
            }
          }}
        >
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="teammate@company.com" className="h-10 border-slate-200 bg-white pl-10" />
          </div>
          <select value={role} onChange={(event) => setRole(event.target.value as TeamMemberRole)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option>Admin</option>
            <option>Manager</option>
            <option>Member</option>
            <option>Viewer</option>
          </select>
          <Button className="h-10 bg-sky-600 text-white hover:bg-sky-700">
            <UserPlus className="h-4 w-4" />
            Invite
          </Button>
        </form>
        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      </CardContent>
    </Card>
  );
}

function createLocalAiReply(message: string, user: DashboardUser, projects: Project[], tasks: Task[]) {
  const normalizedMessage = message.toLowerCase();
  const openTasks = tasks.filter((task) => task.status !== "Completed");
  const overdueTasks = openTasks.filter((task) => daysUntil(task.dueDate) < 0);
  const soonTasks = openTasks
    .filter((task) => daysUntil(task.dueDate) >= 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);
  const riskyProjects = projects
    .filter((project) => project.status !== "Completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;

  if (normalizedMessage.includes("status") || normalizedMessage.includes("update") || normalizedMessage.includes("summar")) {
    return `${user.firstName}, here is a clear workspace update: ${projects.length} projects are active in ProjectHub, with ${completedTasks} of ${tasks.length} tasks completed. The closest project deadlines are ${riskyProjects.map((project) => `${project.name} (${dueLabel(project.dueDate)})`).join(", ") || "clear for now"}. ${overdueTasks.length ? `${overdueTasks.length} task${overdueTasks.length === 1 ? " is" : "s are"} overdue and should be handled first.` : "No open tasks are overdue right now."}`;
  }

  if (normalizedMessage.includes("risk") || normalizedMessage.includes("deadline") || normalizedMessage.includes("block")) {
    return `${user.firstName}, the main deadline watchlist is ${riskyProjects.map((project) => `${project.name} at ${project.progress}% progress, ${dueLabel(project.dueDate)}`).join("; ") || "empty right now"}. ${overdueTasks.length ? `The overdue tasks are ${overdueTasks.map((task) => task.title).join(", ")}.` : "I do not see overdue open tasks in the current dashboard data."}`;
  }

  return `${user.firstName}, I would focus on the next open tasks first: ${soonTasks.map((task) => `${task.title} (${dueLabel(task.dueDate)})`).join(", ") || "there are no open tasks"}. After that, review ${riskyProjects[0]?.name || "your highest-priority project"} and either update progress or move blocked work into a clearer status.`;
}

function DashboardAiAssistant({
  user,
  projects,
  tasks,
  compact = false,
  onToast,
}: {
  user: DashboardUser;
  projects: Project[];
  tasks: Task[];
  compact?: boolean;
  onToast?: (title: string, description?: string) => void;
}) {
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const overdueTasks = tasks.filter((task) => daysUntil(task.dueDate) < 0 && task.status !== "Completed").length;
  const upcomingTasks = tasks
    .filter((task) => task.status !== "Completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi ${user.firstName}, I can help you prioritize work, summarize project health, draft updates, and spot deadline risks.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const context = useMemo(
    () => ({
      user: {
        name: user.name,
        firstName: user.firstName,
        role: user.role,
      },
      summary: {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks,
        overdueTasks,
        hoursTracked: tasks.reduce((sum, task) => sum + task.hours, 0),
      },
      projects: projects.map((project) => ({
        name: project.name,
        client: project.client,
        status: project.status,
        progress: project.progress,
        dueDate: project.dueDate,
        dueIn: dueLabel(project.dueDate),
      })),
      tasks: tasks.map((task) => ({
        title: task.title,
        status: task.status,
        dueDate: task.dueDate,
        dueIn: dueLabel(task.dueDate),
        assignee: task.assignee,
        hours: task.hours,
        project: projects.find((project) => project.id === task.projectId)?.name || "No project",
      })),
    }),
    [completedTasks, overdueTasks, projects, tasks, user],
  );

  const sendMessage = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    const nextMessages: AiMessage[] = [
      ...messages,
      { id: `user-${Date.now()}`, role: "user", content: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/ai/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          messages: messages.slice(-8),
          context,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "The assistant could not respond.");
      }

      if (data.mode === "local") {
        setError(
          data.warning
            ? `Hosted AI is unavailable: ${data.warning} Using local workspace mode.`
            : "Hosted AI is unavailable, so ProjectHub AI is using local workspace mode.",
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply || "I am here, but I did not receive a usable reply.",
        },
      ]);
      onToast?.("AI response ready", "ProjectHub AI added a reply.");
    } catch (caughtError) {
      const messageText =
        caughtError instanceof Error
          ? caughtError.message
          : "The assistant is temporarily unavailable.";
      setError(`${messageText} Using local workspace mode for now.`);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: createLocalAiReply(trimmed, user, projects, tasks),
        },
      ]);
      onToast?.("AI fallback used", "A local workspace answer was generated.");
    } finally {
      setIsSending(false);
    }
  };

  const suggestions = [
    "What should I focus on today?",
    "Summarize risky deadlines.",
    "Draft a project status update.",
  ];

  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-950">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-50 text-sky-600">
              <Sparkles className="h-4 w-4" />
            </span>
            ProjectHub AI
          </CardTitle>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Fluent workspace help, grounded in your current projects and tasks.
          </p>
        </div>
        <div className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 sm:block">
          Context aware
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`space-y-3 overflow-y-auto pr-1 ${compact ? "max-h-[300px]" : "max-h-[520px]"}`}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-sky-600 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking through your workspace...
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => sendMessage(suggestion)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage(input);
          }}
        >
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about priorities, blockers, timelines..."
            className="h-11 border-slate-200 bg-white text-sm"
          />
          <Button disabled={isSending || !input.trim()} className="h-11 bg-sky-600 px-4 text-white hover:bg-sky-700">
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>

        {error && <p className="text-xs text-red-500">{error}</p>}
        {upcomingTasks.length > 0 && (
          <p className="text-xs text-slate-500">
            Reading {projects.length} projects, {tasks.length} tasks, and {upcomingTasks.length} upcoming open tasks.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardContent({ authEnabled, user }: { authEnabled: boolean; user: DashboardUser }) {
  const [activeView, setActiveView] = useState<ViewKey>("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dateRange, setDateRange] = useState("May 1 - Jun 30, 2026");
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>([
    { id: "slack", name: "Slack", status: "Available" },
    { id: "github", name: "GitHub", status: "Available" },
    { id: "drive", name: "Google Drive", status: "Available" },
  ]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    "Email notifications": true,
    "Weekly digest": true,
    "Compact dashboard": false,
  });
  const [planName, setPlanName] = useState("Pro");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isSavingDashboard, setIsSavingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const hasLoadedDashboard = useRef(false);
  const skipNextSaveToast = useRef(false);

  const showToast = (title: string, description?: string) => {
    const id = createId();
    setToasts((current) => [...current, { id, title, description }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  };

  useEffect(() => {
    const controller = new AbortController();

    hasLoadedDashboard.current = false;
    setIsLoadingDashboard(true);
    setDashboardError("");

    fetch(`/api/dashboard?${getDashboardQuery(user)}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load dashboard data.");
        setProjects(data.projects || []);
        setTasks(data.tasks || []);
        setInvoices(data.invoices || []);
        setTeamMembers(data.teamMembers || []);
        skipNextSaveToast.current = true;
        hasLoadedDashboard.current = true;
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setDashboardError(error instanceof Error ? error.message : "Could not load dashboard data.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingDashboard(false);
      });

    return () => controller.abort();
  }, [user.clerkId, user.email, user.firstName, user.imageUrl, user.name, user.role]);

  useEffect(() => {
    if (!hasLoadedDashboard.current) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setIsSavingDashboard(true);
      setDashboardError("");

      fetch("/api/dashboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ user, projects, tasks, invoices, teamMembers }),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || "Could not save dashboard data.");
          if (skipNextSaveToast.current) {
            skipNextSaveToast.current = false;
            return;
          }
          showToast("Saved to database", "Workspace changes were persisted.");
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          const message = error instanceof Error ? error.message : "Could not save dashboard data.";
          setDashboardError(message);
          showToast("Save failed", message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSavingDashboard(false);
        });
    }, 500);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [projects, tasks, invoices, teamMembers, user.clerkId, user.email, user.firstName, user.imageUrl, user.name, user.role]);

  const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);
  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return projects.filter((project) => `${project.name} ${project.client} ${project.status}`.toLowerCase().includes(query));
  }, [projects, searchQuery]);
  const filteredTasks = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return tasks.filter((task) => {
      const project = projectById.get(task.projectId);
      return `${task.title} ${task.status} ${task.assignee} ${project?.name || ""}`.toLowerCase().includes(query);
    });
  }, [tasks, projectById, searchQuery]);
  const filteredInvoices = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return invoices.filter((invoice) => {
      const project = projectById.get(invoice.projectId);
      return `${invoice.number} ${invoice.client} ${invoice.status} ${project?.name || ""}`.toLowerCase().includes(query);
    });
  }, [invoices, projectById, searchQuery]);

  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const totalHours = tasks.reduce((sum, task) => sum + task.hours, 0);
  const taskOverviewData = [
    { name: "Completed", value: completedTasks, color: "#34c77b" },
    { name: "In Progress", value: tasks.filter((task) => task.status === "In Progress").length, color: "#3182f6" },
    { name: "To Do", value: tasks.filter((task) => task.status === "To Do").length, color: "#d6dbe4" },
  ];
  const workloadData = teamMembers.map((member) => ({
    name: member.name,
    completed: tasks.filter((task) => task.assignee === member.name && task.status === "Completed").reduce((sum, task) => sum + task.hours, 0),
    progress: tasks.filter((task) => task.assignee === member.name && task.status === "In Progress").reduce((sum, task) => sum + task.hours, 0),
    todo: tasks.filter((task) => task.assignee === member.name && task.status === "To Do").reduce((sum, task) => sum + task.hours, 0),
  }));
  const progressData = projects.slice(0, 5).map((project, index) => ({
    name: formatDate(project.dueDate),
    website: Math.min(100, Math.max(10, project.progress + index * 4 - 15)),
    mobile: Math.min(100, Math.max(10, project.progress + index * 3 - 25)),
    marketing: Math.min(100, Math.max(5, project.progress + index * 2 - 35)),
  }));
  const upcomingDeadlines = [...projects].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const clientRows = useMemo(() => {
    const derivedClients = Array.from(new Set([...projects.map((project) => project.client), ...invoices.map((invoice) => invoice.client)]))
      .filter(Boolean)
      .map((name) => ({
        id: `derived-${name}`,
        name,
        contact: `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@example.com`,
        projects: projects.filter((project) => project.client === name).length,
      }));

    const customClientNames = new Set(clients.map((client) => client.name));
    return [...clients, ...derivedClients.filter((client) => !customClientNames.has(client.name))];
  }, [clients, invoices, projects]);
  const stats = [
    { title: "Total Projects", value: String(projects.length), change: "+12%", note: "from last month" },
    { title: "Tasks Completed", value: String(completedTasks), change: "+18%", note: "from last month" },
    { title: "Team Members", value: String(teamMembers.length), change: `+${teamMembers.filter((member) => member.status === "Invited").length}`, note: "pending invites" },
    { title: "Hours Tracked", value: `${totalHours}h`, change: "+8%", note: "from last month" },
  ];
  const selectView = (view: ViewKey) => {
    setActiveView(view);
    setIsMobileSidebarOpen(false);
  };

  const getExportData = () => {
    if (activeView === "Projects" || activeView === "Calendar") return { projects: filteredProjects };
    if (activeView === "Tasks" || activeView === "Time Tracking") return { tasks: filteredTasks, workload: workloadData };
    if (activeView === "Invoices" || activeView === "Billing") return { invoices: filteredInvoices };
    if (activeView === "Team") return { teamMembers };
    if (activeView === "Clients") return { clients: clientRows };
    if (activeView === "Files") return { files };
    if (activeView === "Integrations") return { integrations };
    if (activeView === "Reports") return { reports, stats, projects, tasks, invoices };
    return { stats, projects, tasks, invoices, teamMembers };
  };

  const exportCurrentView = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      view: activeView,
      dateRange,
      data: getExportData(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `projecthub-${activeView.toLowerCase().replace(/\s+/g, "-")}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Export ready", `${activeView} data was downloaded.`);
  };

  const cycleDateRange = () => {
    const ranges = ["May 1 - Jun 30, 2026", "Jun 1 - Jun 30, 2026", "Q2 2026", "Year to date 2026"];
    const nextRange = ranges[(ranges.indexOf(dateRange) + 1) % ranges.length];
    setDateRange(nextRange);
    showToast("Date range updated", nextRange);
  };

  const createClient = () => {
    const index = clients.length + 1;
    setClients((current) => [
      { id: createId(), name: `New Client ${index}`, contact: `client${index}@example.com`, projects: 0 },
      ...current,
    ]);
    showToast("Client created", `New Client ${index} was added.`);
  };

  const createFile = () => {
    const projectName = projects[0]?.name || "Workspace";
    const index = files.length + 1;
    setFiles((current) => [
      { id: createId(), name: `Project brief ${index}.pdf`, project: projectName, uploadedAt: new Date().toISOString().slice(0, 10) },
      ...current,
    ]);
    showToast("File attached", `Project brief ${index}.pdf was added to ${projectName}.`);
  };

  const createReport = () => {
    const report = { id: createId(), name: `${activeView} snapshot`, createdAt: new Date().toISOString().slice(0, 10) };
    setReports((current) => [report, ...current]);
    showToast("Report created", `${report.name} is ready.`);
  };

  const connectIntegration = (integrationId: string) => {
    if (!integrationId) return;
    setIntegrations((current) =>
      current.map((integration) =>
        integration.id === integrationId ? { ...integration, status: "Connected" } : integration,
      ),
    );
    const integration = integrations.find((item) => item.id === integrationId);
    showToast("Integration connected", `${integration?.name || "Integration"} is now connected.`);
  };

  const updatePreference = (setting: string) => {
    const nextValue = !preferences[setting];
    setPreferences((current) => ({ ...current, [setting]: nextValue }));
    showToast("Setting saved", `${setting} was turned ${nextValue ? "on" : "off"}.`);
  };

  const updatePlan = () => {
    const nextPlan = planName === "Pro" ? "Business" : "Pro";
    setPlanName(nextPlan);
    showToast("Plan updated", `Current plan changed to ${nextPlan}.`);
  };

  const handleNewAction = () => {
    if (activeView === "Tasks") {
      setShowTaskForm(true);
    } else if (activeView === "Invoices" || activeView === "Billing") {
      setShowInvoiceForm(true);
      setActiveView("Invoices");
    } else if (activeView === "Team") {
      setShowTeamForm(true);
    } else if (activeView === "Clients") {
      createClient();
    } else if (activeView === "Files") {
      createFile();
    } else if (activeView === "Integrations") {
      connectIntegration(integrations.find((integration) => integration.status === "Available")?.id || integrations[0]?.id || "");
    } else if (activeView === "Reports") {
      createReport();
    } else if (activeView === "Time Tracking") {
      setShowTaskForm(true);
    } else {
      setShowProjectForm(true);
      if (activeView !== "Projects") setActiveView("Projects");
    }
  };

  const createProject = (project: Omit<Project, "id" | "progress" | "color" | "icon">) => {
    const colors = ["indigo", "blue", "emerald", "violet", "orange"] as const;
    const icons = ["zap", "briefcase", "message", "clock", "inbox"] as const;
    const index = projects.length % colors.length;
    setProjects((current) => [
      {
        ...project,
        id: createId(),
        progress: project.status === "Completed" ? 100 : project.status === "In Progress" ? 45 : 10,
        color: colors[index],
        icon: icons[index],
      },
      ...current,
    ]);
    setShowProjectForm(false);
    setActiveView("Projects");
    showToast("Project created", `${project.name} was added to Projects.`);
  };

  const createTask = (task: Omit<Task, "id" | "status">) => {
    setTasks((current) => [{ ...task, id: createId(), status: "To Do" }, ...current]);
    setShowTaskForm(false);
    setActiveView("Tasks");
    showToast("Task created", `${task.title} was added to Tasks.`);
  };

  const toggleTask = (taskId: string) => {
    const selectedTask = tasks.find((task) => task.id === taskId);
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "Completed" ? "To Do" : "Completed" }
          : task,
      ),
    );
    if (selectedTask) showToast("Task updated", `${selectedTask.title} was ${selectedTask.status === "Completed" ? "reopened" : "completed"}.`);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, status } : task));
    showToast("Task status updated", `Task moved to ${status}.`);
  };

  const updateProjectStatus = (projectId: string, status: ProjectStatus) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? { ...project, status, progress: status === "Completed" ? 100 : status === "Planning" ? Math.min(project.progress, 30) : project.progress }
          : project,
      ),
    );
    showToast("Project status updated", `Project moved to ${status}.`);
  };

  const createInvoice = (invoice: Omit<Invoice, "id" | "number" | "status">) => {
    const nextNumber = `INV-${1000 + invoices.length + 1}`;
    setInvoices((current) => [
      {
        ...invoice,
        id: createId(),
        number: nextNumber,
        status: "Draft",
      },
      ...current,
    ]);
    setShowInvoiceForm(false);
    setActiveView("Invoices");
    showToast("Invoice created", `${nextNumber} was created for ${invoice.client}.`);
  };

  const updateInvoiceStatus = (invoiceId: string, status: InvoiceStatus) => {
    setInvoices((current) => current.map((invoice) => invoice.id === invoiceId ? { ...invoice, status } : invoice));
    showToast("Invoice updated", `Invoice marked ${status}.`);
  };

  const inviteTeamMember = (member: Pick<TeamMember, "email" | "role">) => {
    const normalizedEmail = member.email.toLowerCase();
    const alreadyExists = teamMembers.some((teamMember) => teamMember.email.toLowerCase() === normalizedEmail);
    if (alreadyExists) return false;

    const emailName = normalizedEmail.split("@")[0] || "New teammate";
    const displayName = emailName
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(" ") || normalizedEmail;

    setTeamMembers((current) => [
      {
        id: createId(),
        name: displayName,
        email: normalizedEmail,
        role: member.role,
        status: "Invited",
        joinedAt: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ]);
    showToast("Invitation sent", `${normalizedEmail} was invited as ${member.role}.`);
    return true;
  };

  const updateTeamMemberRole = (memberId: string, role: TeamMemberRole) => {
    setTeamMembers((current) => current.map((member) => member.id === memberId ? { ...member, role } : member));
    showToast("Role updated", `Team member role changed to ${role}.`);
  };

  const markTeamMemberActive = (memberId: string) => {
    setTeamMembers((current) => current.map((member) => member.id === memberId ? { ...member, status: "Active" } : member));
    showToast("Member activated", "The invitation is now marked active.");
  };

  const renderProjectRow = (project: Project) => {
    const color = projectColorClasses[project.color as keyof typeof projectColorClasses] || projectColorClasses.indigo;
    const Icon = projectIcons[project.icon];
    return (
      <div key={project.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3 sm:grid-cols-[auto_1fr_auto_auto_auto] sm:gap-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${color.bg}`}>
          <Icon className={`h-4 w-4 ${color.text}`} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-950">{project.name}</p>
          <p className="text-xs text-slate-500">{project.client}</p>
        </div>
        <select value={project.status} onChange={(event) => updateProjectStatus(project.id, event.target.value as ProjectStatus)} className="hidden h-8 rounded-md border border-slate-200 bg-white px-2 text-xs md:block">
          <option>Planning</option>
          <option>In Progress</option>
          <option>On Hold</option>
          <option>Completed</option>
        </select>
        <div className="hidden w-28 items-center gap-3 sm:flex">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div className={`h-full rounded-full ${color.bar}`} style={{ width: `${project.progress}%` }} />
          </div>
          <span className="w-8 text-xs text-slate-500">{project.progress}%</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md text-slate-500"
          onClick={() => {
            setShowProjectForm(true);
            setActiveView("Projects");
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderTaskRow = (task: Task) => {
    const project = projectById.get(task.projectId);
    const days = daysUntil(task.dueDate);
    const tone = days <= 2 && task.status !== "Completed" ? "text-red-500" : days <= 4 ? "text-orange-500" : "text-slate-500";
    return (
      <label key={task.id} className="grid cursor-pointer grid-cols-[auto_1fr_auto] items-start gap-3 py-3 md:grid-cols-[auto_1fr_auto_auto]">
        <input type="checkbox" checked={task.status === "Completed"} onChange={() => toggleTask(task.id)} className="mt-1 h-4 w-4 rounded border-slate-300" />
        <span>
          <span className={`block text-sm font-bold leading-5 ${task.status === "Completed" ? "text-slate-400 line-through" : "text-slate-950"}`}>{task.title}</span>
          <span className="text-xs text-slate-500">{project?.name || "No project"} · {task.assignee}</span>
        </span>
        <select value={task.status} onChange={(event) => updateTaskStatus(task.id, event.target.value as TaskStatus)} className="hidden h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-field-foreground md:block">
          <option>To Do</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <span className={`text-xs ${tone}`}>{dueLabel(task.dueDate)}</span>
      </label>
    );
  };

  const renderInvoiceRow = (invoice: Invoice) => {
    const project = projectById.get(invoice.projectId);
    const statusTone = {
      Draft: "bg-slate-100 text-slate-600",
      Sent: "bg-blue-50 text-blue-600",
      Paid: "bg-emerald-50 text-emerald-600",
      Overdue: "bg-red-50 text-red-600",
    }[invoice.status];

    return (
      <div key={invoice.id} className="grid gap-4 py-4 md:grid-cols-[1fr_1.1fr_auto_auto_auto] md:items-center">
        <div>
          <p className="text-sm font-bold text-slate-950">{invoice.number}</p>
          <p className="text-xs text-slate-500">Issued {formatDate(invoice.issueDate)}</p>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-950">{invoice.client}</p>
          <p className="truncate text-xs text-slate-500">{project?.name || "No project"}</p>
        </div>
        <p className="text-sm font-bold text-slate-950">{formatMoney(invoice.amount)}</p>
        <div>
          <p className="text-xs font-semibold text-slate-500">Due {formatDate(invoice.dueDate)}</p>
          <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusTone}`}>{invoice.status}</span>
        </div>
        <select value={invoice.status} onChange={(event) => updateInvoiceStatus(invoice.id, event.target.value as InvoiceStatus)} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs">
          <option>Draft</option>
          <option>Sent</option>
          <option>Paid</option>
          <option>Overdue</option>
        </select>
      </div>
    );
  };

  const renderInvoices = () => {
    const paidTotal = invoices.filter((invoice) => invoice.status === "Paid").reduce((sum, invoice) => sum + invoice.amount, 0);
    const outstandingTotal = invoices.filter((invoice) => invoice.status === "Sent" || invoice.status === "Overdue").reduce((sum, invoice) => sum + invoice.amount, 0);
    const draftTotal = invoices.filter((invoice) => invoice.status === "Draft").reduce((sum, invoice) => sum + invoice.amount, 0);
    const overdueTotal = invoices.filter((invoice) => invoice.status === "Overdue").reduce((sum, invoice) => sum + invoice.amount, 0);
    const invoiceStats = [
      { label: "Paid", value: formatMoney(paidTotal), tone: "text-emerald-600" },
      { label: "Outstanding", value: formatMoney(outstandingTotal), tone: "text-blue-600" },
      { label: "Drafts", value: formatMoney(draftTotal), tone: "text-slate-700" },
      { label: "Overdue", value: formatMoney(overdueTotal), tone: "text-red-500" },
    ];

    return (
      <div className="space-y-4">
        {showInvoiceForm && <InvoiceForm projects={projects} onCreate={createInvoice} />}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {invoiceStats.map((stat) => (
            <Card key={stat.label} className="rounded-lg border-slate-200 bg-white shadow-none">
              <CardContent className="p-5">
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className={`mt-3 text-2xl font-bold ${stat.tone}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-lg border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-slate-950">Invoices</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Create invoices, track balances, and update payment status.</p>
            </div>
            <Button onClick={() => {
              setShowInvoiceForm((value) => !value);
            }} className="bg-sky-600 text-white hover:bg-sky-700">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length ? (
              <div className="divide-y divide-slate-100">{filteredInvoices.map(renderInvoiceRow)}</div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
                <p className="font-bold text-slate-950">No invoices found</p>
                <p className="mt-1 text-sm text-slate-500">Try a different search or create a new invoice.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTeam = () => {
    const activeMembers = teamMembers.filter((member) => member.status === "Active").length;
    const invitedMembers = teamMembers.filter((member) => member.status === "Invited").length;

    return (
      <div className="space-y-4">
        {showTeamForm && <TeamMemberForm onInvite={inviteTeamMember} />}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg border-slate-200 bg-white shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-slate-600">Total Members</p>
              <p className="mt-3 text-2xl font-bold text-slate-950">{teamMembers.length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg border-slate-200 bg-white shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-slate-600">Active</p>
              <p className="mt-3 text-2xl font-bold text-emerald-600">{activeMembers}</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg border-slate-200 bg-white shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-slate-600">Invited</p>
              <p className="mt-3 text-2xl font-bold text-blue-600">{invitedMembers}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-lg border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-slate-950">Team</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Invite teammates by email and manage workspace roles.</p>
            </div>
            <Button onClick={() => {
              setShowTeamForm((value) => !value);
            }} className="bg-sky-600 text-white hover:bg-sky-700">
              <UserPlus className="h-4 w-4" />
              Add by Email
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {teamMembers.map((member) => {
              const assignedTasks = tasks.filter((task) => task.assignee === member.name).length;
              return (
                <div key={member.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar><AvatarFallback>{getInitials(member.name)}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-950">{member.name}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${member.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>{member.status}</span>
                      </div>
                      <p className="truncate text-sm text-slate-500">{member.email}</p>
                      <p className="mt-2 text-sm text-slate-500">{assignedTasks} assigned tasks · Joined {formatDate(member.joinedAt)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <select value={member.role} onChange={(event) => updateTeamMemberRole(member.id, event.target.value as TeamMemberRole)} className="h-9 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs">
                      <option>Admin</option>
                      <option>Manager</option>
                      <option>Member</option>
                      <option>Viewer</option>
                    </select>
                    {member.status === "Invited" && (
                      <Button onClick={() => markTeamMemberActive(member.id)} variant="outline" className="h-9 rounded-md border-slate-200 bg-white text-xs">
                        Mark Active
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderReports = () => (
    <div className="space-y-4">
      <Card className="rounded-lg border-slate-200 bg-white shadow-none">
        <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-slate-950">Reports</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Generate snapshots and export operational data.</p>
          </div>
          <Button onClick={createReport} className="bg-sky-600 text-white hover:bg-sky-700">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.title} className="rounded-lg border border-slate-200 p-5">
              <p className="text-sm text-slate-600">{stat.title}</p>
              <p className="mt-3 text-2xl font-bold text-slate-950">{stat.value}</p>
            </div>
          ))}
          {reports.map((report) => (
            <div key={report.id} className="rounded-lg border border-slate-200 p-5">
              <p className="text-sm font-bold text-slate-950">{report.name}</p>
              <p className="mt-1 text-xs text-slate-500">Created {formatDate(report.createdAt)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      {renderDashboard()}
    </div>
  );

  const renderClients = () => (
    <Card className="rounded-lg border-slate-200 bg-white shadow-none">
      <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <CardTitle className="text-slate-950">Clients</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Track client contacts and linked project work.</p>
        </div>
        <Button onClick={createClient} className="bg-sky-600 text-white hover:bg-sky-700">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {clientRows.map((client) => (
          <div key={client.id} className="rounded-lg border border-slate-200 p-5">
            <p className="font-bold text-slate-950">{client.name}</p>
            <p className="mt-1 text-sm text-slate-500">{client.contact}</p>
            <p className="mt-4 text-sm font-semibold text-sky-600">{client.projects} linked projects</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderFiles = () => (
    <Card className="rounded-lg border-slate-200 bg-white shadow-none">
      <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <CardTitle className="text-slate-950">Files</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Attach workspace documents to projects.</p>
        </div>
        <Button onClick={createFile} className="bg-sky-600 text-white hover:bg-sky-700">
          <Upload className="h-4 w-4" />
          Attach File
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {files.length ? files.map((file) => (
          <div key={file.id} className="rounded-lg border border-slate-200 p-5">
            <p className="font-bold text-slate-950">{file.name}</p>
            <p className="mt-1 text-sm text-slate-500">{file.project} · {formatDate(file.uploadedAt)}</p>
          </div>
        )) : (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center md:col-span-2">
            <p className="font-bold text-slate-950">No files attached yet</p>
            <p className="mt-1 text-sm text-slate-500">Use Attach File or the New button to create one.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSettings = () => (
    <Card className="rounded-lg border-slate-200 bg-white shadow-none">
      <CardHeader>
        <CardTitle className="text-slate-950">Settings</CardTitle>
        <p className="mt-1 text-sm text-slate-500">Manage workspace preferences and notifications.</p>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {Object.keys(preferences).map((setting) => (
          <Button key={setting} onClick={() => updatePreference(setting)} variant="outline" className="h-11 justify-start rounded-md border-slate-200 bg-white">
            <Settings className="h-4 w-4" />
            {setting}: {preferences[setting] ? "On" : "Off"}
          </Button>
        ))}
      </CardContent>
    </Card>
  );

  const renderIntegrations = () => (
    <Card className="rounded-lg border-slate-200 bg-white shadow-none">
      <CardHeader>
        <CardTitle className="text-slate-950">Integrations</CardTitle>
        <p className="mt-1 text-sm text-slate-500">Connect the tools your team uses every day.</p>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {integrations.map((integration) => (
          <div key={integration.id} className="rounded-lg border border-slate-200 p-5">
            <p className="font-bold text-slate-950">{integration.name}</p>
            <p className="mt-1 text-sm text-slate-500">{integration.status}</p>
            <Button
              onClick={() => connectIntegration(integration.id)}
              disabled={integration.status === "Connected"}
              className="mt-4 h-9 w-full rounded-md bg-sky-600 text-white hover:bg-sky-700"
            >
              {integration.status === "Connected" ? "Connected" : "Connect"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderBilling = () => (
    <div className="space-y-4">
      {showInvoiceForm && <InvoiceForm projects={projects} onCreate={createInvoice} />}
      <Card className="rounded-lg border-slate-200 bg-white shadow-none">
        <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-slate-950">Billing</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Manage plan, seats, and invoice records.</p>
          </div>
          <Button onClick={() => {
            setShowInvoiceForm((value) => !value);
          }} className="bg-sky-600 text-white hover:bg-sky-700">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-600">Current Plan</p>
            <p className="mt-3 text-2xl font-bold text-slate-950">{planName}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-600">Seats</p>
            <p className="mt-3 text-2xl font-bold text-slate-950">{teamMembers.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-600">Paid invoices</p>
            <p className="mt-3 text-2xl font-bold text-emerald-600">{invoices.filter((invoice) => invoice.status === "Paid").length}</p>
          </div>
          <Button onClick={updatePlan} variant="outline" className="h-11 justify-start rounded-md border-slate-200 bg-white md:col-span-3">
            <CreditCard className="h-4 w-4" />
            Manage subscription
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="rounded-lg border-slate-200 bg-white shadow-none">
            <CardContent className="p-6 text-slate-950">
              <p className="text-sm text-slate-600">{stat.title}</p>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{stat.value}</p>
              <p className="mt-3 text-xs text-slate-600">
                <span className="font-bold text-emerald-500">{stat.change}</span> {stat.note}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Card className="rounded-lg border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-3">
            <CardTitle className="text-base font-bold text-slate-950">Project Progress</CardTitle>
            <Button onClick={cycleDateRange} variant="outline" size="sm" className="h-8 rounded-md border-slate-200 bg-white text-xs">
              {dateRange.includes("Jun 1") ? "This Month" : "Period"} <ChevronDown className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="mb-4 flex justify-center gap-8 text-xs text-slate-600">
              <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-sky-600" />Delivery</span>
              <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-blue-500" />Design</span>
              <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-500" />Marketing</span>
            </div>
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="#64748b" />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#64748b" tickFormatter={(value) => `${value}%`} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="website" stroke="#0284c7" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="mobile" stroke="#3182f6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="marketing" stroke="#34c77b" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-950">Tasks Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid items-center gap-6 pb-6 md:grid-cols-[1fr_0.85fr] xl:grid-cols-[1fr_0.8fr]">
            <div className="relative h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskOverviewData} dataKey="value" innerRadius={58} outerRadius={82} paddingAngle={4}>
                    {taskOverviewData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-950">{tasks.length}</span>
                <span className="text-sm text-slate-600">Total</span>
              </div>
            </div>
            <div className="space-y-5">
              {taskOverviewData.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-5 text-sm">
                  <span className="flex items-center gap-3 text-slate-700">
                    <i className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Card className="rounded-lg border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-0">
            <CardTitle className="text-base font-bold text-slate-950">Recent Projects</CardTitle>
            <Button onClick={() => selectView("Projects")} variant="link" className="h-auto p-0 text-xs font-bold text-sky-600">View all</Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="divide-y divide-slate-100">
              {filteredProjects.slice(0, 5).map(renderProjectRow)}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-0">
            <CardTitle className="text-base font-bold text-slate-950">My Tasks</CardTitle>
            <Button onClick={() => selectView("Tasks")} variant="link" className="h-auto p-0 text-xs font-bold text-sky-600">View all</Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="divide-y divide-slate-100">
              {filteredTasks.slice(0, 5).map(renderTaskRow)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Card className="rounded-lg border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-2">
            <CardTitle className="text-base font-bold text-slate-950">Team Workload</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="h-[195px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} stroke="#64748b" />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#64748b" tickFormatter={(value) => `${value}h`} />
                  <RechartsTooltip />
                  <Bar dataKey="completed" stackId="a" fill="#34c77b" barSize={34} />
                  <Bar dataKey="progress" stackId="a" fill="#3182f6" />
                  <Bar dataKey="todo" stackId="a" fill="#d6dbe4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-0">
            <CardTitle className="text-base font-bold text-slate-950">Upcoming Deadlines</CardTitle>
            <Button onClick={() => selectView("Calendar")} variant="link" className="h-auto p-0 text-xs font-bold text-sky-600">View calendar</Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {upcomingDeadlines.map((project) => (
                <div key={project.id} className="grid grid-cols-[36px_auto_1fr] items-center gap-3 sm:grid-cols-[44px_auto_1fr_auto]">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500">{formatDate(project.dueDate).split(" ")[0]}</p>
                    <p className="text-sm font-bold text-slate-950">{formatDate(project.dueDate).split(" ")[1]}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-50">
                    <Calendar className="h-4 w-4 text-sky-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950">{project.name}</p>
                    <p className="text-xs text-slate-500">{project.client}</p>
                  </div>
                  <p className="hidden text-xs text-slate-500 sm:block">{dueLabel(project.dueDate)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
      <DashboardAiAssistant user={user} projects={projects} tasks={tasks} compact onToast={showToast} />
      </div>
    </>
  );

  const renderActiveView = () => {
    if (activeView === "Dashboard") return renderDashboard();
    if (activeView === "AI Assistant") {
      return <DashboardAiAssistant user={user} projects={projects} tasks={tasks} onToast={showToast} />;
    }
    if (activeView === "Projects") {
      return (
        <div className="space-y-4">
          {showProjectForm && <ProjectForm onCreate={createProject} />}
          <Card className="rounded-lg border-slate-200 bg-white shadow-none">
            <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <CardTitle className="text-slate-950">Projects</CardTitle>
              <Button onClick={() => {
                setShowProjectForm((value) => !value);
              }} className="bg-sky-600 text-white hover:bg-sky-700">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100">{filteredProjects.map(renderProjectRow)}</div>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (activeView === "Tasks") {
      return (
        <div className="space-y-4">
          {showTaskForm && <TaskForm projects={projects} user={user} onCreate={createTask} />}
          <Card className="rounded-lg border-slate-200 bg-white shadow-none">
            <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <CardTitle className="text-slate-950">Tasks</CardTitle>
              <Button onClick={() => {
                setShowTaskForm((value) => !value);
              }} className="bg-sky-600 text-white hover:bg-sky-700">
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100">{filteredTasks.map(renderTaskRow)}</div>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (activeView === "Calendar") {
      return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-none">
          <CardHeader><CardTitle className="text-slate-950">Calendar</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {upcomingDeadlines.map((project) => (
              <div key={project.id} className="rounded-lg border border-slate-200 p-5">
                <p className="text-sm font-bold text-sky-600">{formatDate(project.dueDate)}</p>
                <h3 className="mt-2 font-heading text-xl font-bold text-slate-950">{project.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{project.client} · {dueLabel(project.dueDate)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }
    if (activeView === "Time Tracking") {
      return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-none">
          <CardHeader><CardTitle className="text-slate-950">Time Tracking</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {teamMembers.map((member) => {
              const hours = tasks.filter((task) => task.assignee === member.name).reduce((sum, task) => sum + task.hours, 0);
              return (
                <div key={member.id} className="rounded-lg border border-slate-200 p-5">
                  <p className="text-sm text-slate-600">{member.name}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-950">{hours}h</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      );
    }
    if (activeView === "Reports") return renderReports();
    if (activeView === "Team") return renderTeam();
    if (activeView === "Clients") return renderClients();
    if (activeView === "Invoices") return renderInvoices();
    if (activeView === "Files") return renderFiles();
    if (activeView === "Settings") return renderSettings();
    if (activeView === "Integrations") return renderIntegrations();
    return renderBilling();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <ToastViewport toasts={toasts} />
      <div className="flex min-h-screen">
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/40"
              aria-label="Close dashboard menu"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <aside className="relative flex h-full w-[min(86vw,320px)] flex-col border-r border-slate-200 bg-white shadow-2xl">
              <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
                <Logo />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-md text-slate-600"
                  aria-label="Close dashboard menu"
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6">
                <nav className="space-y-7">
                  <SidebarGroup title="Main" items={mainNav} activeView={activeView} onSelect={selectView} />
                  <SidebarGroup title="Manage" items={manageNav} activeView={activeView} onSelect={selectView} />
                  <SidebarGroup title="Settings" items={settingsNav} activeView={activeView} onSelect={selectView} />
                </nav>

                <div className="mt-7 rounded-lg bg-sky-50 p-5">
                  <h3 className="mb-3 text-sm font-bold text-sky-600">Upgrade to Pro</h3>
                  <p className="mb-5 text-xs leading-5 text-slate-600">Unlock advanced features, reports, and priority support.</p>
                  <Button onClick={() => selectView("Billing")} className="h-10 w-full rounded-md bg-sky-600 text-sm font-semibold text-white hover:bg-sky-700">Upgrade Now</Button>
                </div>

                <div className="mt-7 flex items-center gap-3">
                  <UserAccountControl authEnabled={authEnabled} user={user} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-950">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email || user.role}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        <aside className="hidden w-[270px] shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="flex h-16 items-center justify-between border-b border-slate-100 px-7">
            <Logo />
            <ChevronLeft className="h-4 w-4 text-slate-500" />
          </div>

          <div className="flex flex-1 flex-col px-6 py-7">
            <nav className="space-y-7">
              <SidebarGroup title="Main" items={mainNav} activeView={activeView} onSelect={selectView} />
              <SidebarGroup title="Manage" items={manageNav} activeView={activeView} onSelect={selectView} />
              <SidebarGroup title="Settings" items={settingsNav} activeView={activeView} onSelect={selectView} />
            </nav>

            <div className="mt-auto rounded-lg bg-sky-50 p-5">
              <h3 className="mb-3 text-sm font-bold text-sky-600">Upgrade to Pro</h3>
              <p className="mb-5 text-xs leading-5 text-slate-600">Unlock advanced features, reports, and priority support.</p>
              <Button onClick={() => selectView("Billing")} className="h-10 w-full rounded-md bg-sky-600 text-sm font-semibold text-white hover:bg-sky-700">Upgrade Now</Button>
            </div>

            <div className="mt-7 flex items-center gap-3">
              <UserAccountControl authEnabled={authEnabled} user={user} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-950">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email || user.role}</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-slate-50">
          <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:flex-nowrap sm:px-5 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-md text-slate-600 lg:hidden"
                aria-label="Open dashboard menu"
                aria-expanded={isMobileSidebarOpen}
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="relative hidden w-[420px] sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search projects, tasks, or people..." className="h-10 rounded-md border-slate-200 bg-white pl-10 text-sm shadow-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button onClick={() => selectView("Settings")} variant="ghost" size="icon" className="rounded-md text-slate-600"><Bell className="h-5 w-5" /></Button>
              <Button onClick={() => selectView("AI Assistant")} variant="ghost" size="icon" className="rounded-md text-slate-600"><MessageSquare className="h-5 w-5" /></Button>
              <div className="flex items-center gap-3 border-l border-slate-200 pl-2 sm:pl-4">
                <UserAccountControl authEnabled={authEnabled} user={user} size="sm" />
                <div className="hidden text-sm sm:block">
                  <p className="font-bold leading-4 text-slate-950">{user.name}</p>
                  <p className="max-w-40 truncate text-xs text-slate-500">{user.email || user.role}</p>
                </div>
              </div>
            </div>
            <div className="relative w-full sm:hidden">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search workspace..." className="h-10 rounded-md border-slate-200 bg-white pl-10 text-sm shadow-none" />
            </div>
          </header>

          <div className="mx-auto max-w-[1180px] px-4 py-5 sm:px-5 sm:py-7 lg:px-8">
            <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-950">{activeView}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  {activeView === "Dashboard"
                    ? `Welcome back, ${user.firstName}! Here's what's happening with your projects.`
                    : `Manage ${activeView.toLowerCase()} for ${user.firstName}'s workspace.`}
                </p>
                <p className={`mt-2 text-xs ${dashboardError ? "text-red-500" : "text-slate-500"}`}>
                  {dashboardError || (isLoadingDashboard ? "Loading dashboard data from database..." : isSavingDashboard ? "Saving dashboard data..." : "Database connected")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={cycleDateRange} variant="outline" className="h-10 flex-1 rounded-md border-slate-200 bg-white px-3 text-sm font-semibold text-field-foreground hover:bg-slate-50 hover:text-slate-950 sm:flex-none sm:px-4">{dateRange} <ChevronDown className="h-4 w-4" /></Button>
                <Button onClick={exportCurrentView} variant="outline" className="h-10 rounded-md border-slate-200 bg-white px-3 text-sm font-semibold text-field-foreground hover:bg-slate-50 hover:text-slate-950 sm:px-4"><Upload className="h-4 w-4" />Export</Button>
                <Button
                  onClick={handleNewAction}
                  className="h-10 bg-sky-600 text-white hover:bg-sky-700"
                >
                  <Plus className="h-4 w-4" />New
                </Button>
              </div>
            </div>

            {isLoadingDashboard ? (
              <Card className="rounded-lg border-slate-200 bg-white shadow-none">
                <CardContent className="flex min-h-72 items-center justify-center p-8 text-sm text-slate-600">
                  Loading dashboard data from database...
                </CardContent>
              </Card>
            ) : (
              renderActiveView()
            )}
          </div>
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
}

function ClerkDashboardContent() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <DashboardContent authEnabled user={{ ...demoUser, name: "Loading...", firstName: "there", email: "" }} />;
  }

  if (!isSignedIn || !user) {
    return <DashboardContent authEnabled user={{ ...demoUser, name: "Guest", firstName: "there", email: "Sign in to personalize your workspace" }} />;
  }

  const fullName = user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "ProjectHub user";
  const firstName = user.firstName || fullName.split(" ")[0] || "there";
  const email = user.primaryEmailAddress?.emailAddress || "";

  return (
    <DashboardContent
      authEnabled
      user={{
        clerkId: user.id,
        name: fullName,
        firstName,
        email,
        initials: getInitials(fullName),
        imageUrl: user.imageUrl,
        role: "Admin",
      }}
    />
  );
}

export function DashboardView({ authEnabled = false }: { authEnabled?: boolean }) {
  if (authEnabled) {
    return <ClerkDashboardContent />;
  }

  return <DashboardContent authEnabled={false} user={demoUser} />;
}
