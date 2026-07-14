import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Flame,
  LayoutDashboard,
  ListChecks,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  Moon,
  NotebookPen,
  PieChart,
  Pin,
  Play,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings,
  Sparkles,
  Star,
  Sun,
  Target,
  TimerReset,
  Trash2,
  User,
  UserPlus,
  X
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  analyticsApi,
  assignmentsApi,
  authApi,
  clearSession,
  eventsApi,
  getStoredSession,
  habitsApi,
  notesApi,
  pomodoroApi,
  saveSession,
  tasksApi
} from "./api";

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler);

const navItems = [
  { label: "Dashboard", value: "dashboard", icon: LayoutDashboard },
  { label: "Tasks", value: "tasks", icon: ListChecks },
  { label: "Assignments", value: "assignments", icon: CheckCircle2 },
  { label: "Habits", value: "habits", icon: Flame },
  { label: "Calendar", value: "calendar", icon: CalendarDays },
  { label: "Notes", value: "notes", icon: NotebookPen },
  { label: "Settings", value: "settings", icon: Settings }
];


const emptySummary = {
  completedTasks: 0,
  pendingTasks: 0,
  upcomingAssignments: 0,
  studyHours: 0,
  pomodoros: 0,
  habitCompletionRate: 0,
  productivityScore: 0
};

const emptyData = {
  tasks: [],
  assignments: [],
  habits: [],
  notes: [],
  events: [],
  pomodoros: [],
  summary: emptySummary
};

function App() {
  const savedSession = useMemo(() => getStoredSession(), []);
  const [session, setSession] = useState(savedSession);
  const [darkMode, setDarkMode] = useState(() => savedSession?.user?.preferences?.theme === "dark");
  const [activeView, setActiveView] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(emptyData);


  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (session?.token) loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [tasks, assignments, habits, notes, events, pomodoros, summary] = await Promise.all([
        tasksApi.list(),
        assignmentsApi.list(),
        habitsApi.list(),
        notesApi.list(),
        eventsApi.list(),
        pomodoroApi.list(),
        analyticsApi.summary()
      ]);
      setData({ tasks, assignments, habits, notes, events, pomodoros, summary });
    } catch (error) {
      setNotice(error.message);
      if (error.message.toLowerCase().includes("token")) handleLogout();
    } finally {
      setLoading(false);
    }
  }

  function handleAuth(nextSession) {
    saveSession(nextSession);
    setSession(nextSession);
    setDarkMode(nextSession.user?.preferences?.theme === "dark");
    setNotice("Welcome to FocusFlow.");
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setData(emptyData);
  }

  async function updateUser(nextUser) {
    const nextSession = { ...session, user: nextUser };
    saveSession(nextSession);
    setSession(nextSession);
    setDarkMode(nextUser.preferences?.theme === "dark");
  }

  async function runAction(action, message) {
    setNotice("");
    try {
      await action();
      await loadDashboard();
      setNotice(message);
    } catch (error) {
      setNotice(error.message);
    }
  }

  const filteredData = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return data;
    const includes = (values) => values.filter(Boolean).join(" ").toLowerCase().includes(search);
    return {
      ...data,
      tasks: data.tasks.filter((task) => includes([task.title, task.category, task.description, task.priority])),
      assignments: data.assignments.filter((assignment) => includes([assignment.title, assignment.subject, assignment.status])),
      habits: data.habits.filter((habit) => includes([habit.name])),
      notes: data.notes.filter((note) => includes([note.title, note.subject, note.content])),
      events: data.events.filter((event) => includes([event.title, event.type]))
    };
  }, [data, query]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: darkMode ? "#111827" : "#18212f" } },
      scales: {
        x: { grid: { display: false }, ticks: { color: darkMode ? "#cbd5e1" : "#64748b" } },
        y: {
          beginAtZero: true,
          grid: { color: darkMode ? "rgba(148,163,184,.16)" : "rgba(100,116,139,.14)" },
          ticks: { color: darkMode ? "#cbd5e1" : "#64748b", precision: 0 }
        }
      }
    }),
    [darkMode]
  );

  return (
    <main className="min-h-screen bg-stone-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {session ? (
        <div className="mx-auto grid min-h-screen max-w-[1560px] grid-cols-1 lg:grid-cols-[280px_1fr]">
          <Sidebar activeView={activeView} setActiveView={setActiveView} summary={data.summary} />
          {mobileNavOpen ? (
            <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileNavOpen(false)}>
              <div className="h-full w-[min(86vw,320px)]" onClick={(event) => event.stopPropagation()}>
                <Sidebar activeView={activeView} setActiveView={setActiveView} summary={data.summary} mobile onClose={() => setMobileNavOpen(false)} />
              </div>
            </div>
          ) : null}
          <section className="min-w-0 px-4 pb-8 sm:px-6 lg:px-8">
            <TopBar
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              user={session.user}
              onLogout={handleLogout}
              query={query}
              setQuery={setQuery}
              setActiveView={setActiveView}
              onOpenNav={() => setMobileNavOpen(true)}
              onNotify={() => setNotice("No unread notifications. Your workspace is up to date.")}
            />
            {notice ? <StatusMessage message={notice} onDismiss={() => setNotice("")} /> : null}
            {loading ? <LoadingStrip /> : null}
            <DashboardView
              activeView={activeView}
              data={filteredData}
              rawData={data}
              chartOptions={chartOptions}
              runAction={runAction}
              setActiveView={setActiveView}
              user={session.user}
              updateUser={updateUser}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          </section>
        </div>
      ) : (
        <AuthPage darkMode={darkMode} setDarkMode={setDarkMode} onAuth={handleAuth} />
      )}
    </main>
  );
}

function AuthPage({ darkMode, setDarkMode, onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = isRegister ? form : { email: form.email, password: form.password };
      onAuth(isRegister ? await authApi.register(payload) : await authApi.login(payload));
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
      <div className="relative flex min-h-[46vh] flex-col justify-between overflow-hidden bg-slate-950 p-6 text-white sm:p-10 lg:min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(20,184,166,.28),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(245,158,11,.2),transparent_26%)]" />
        <div className="relative flex items-center justify-between gap-4">
          <BrandMark inverse />
          <button className="icon-button-dark" title="Toggle theme" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <div className="relative my-10 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[.2em] text-teal-300">FocusFlow 2.0</p>
          <h1 className="text-4xl font-black leading-tight sm:text-6xl">A calmer command center for serious study days.</h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Plan tasks, track focus sessions, build habits, and keep notes in one polished workspace backed by your own API.
          </p>
        </div>
        <div className="relative grid gap-3 sm:grid-cols-3">
          <MiniMetric label="Workspace" value="Live API" />
          <MiniMetric label="Security" value="JWT" />
          <MiniMetric label="Focus" value="Timer" />
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-6 inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
            <button className={`segmented ${mode === "login" ? "segmented-active" : ""}`} onClick={() => setMode("login")}>Login</button>
            <button className={`segmented ${mode === "register" ? "segmented-active" : ""}`} onClick={() => setMode("register")}>Register</button>
          </div>
          <div className="panel p-6 sm:p-7">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{isRegister ? "Create your workspace" : "Welcome back"}</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {isRegister ? "Start with a secure account and an empty FocusFlow workspace." : "Log in to continue your day where you left off."}
              </p>
            </div>
            {error ? <StatusMessage message={error} tone="error" /> : null}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {isRegister ? <FormInput icon={User} label="Full name" name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required placeholder="Your name" /> : null}
              <FormInput icon={Mail} label="Email address" name="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required placeholder="you@example.com" />
              <FormInput icon={Lock} label="Password" name="password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={6} placeholder="Minimum 6 characters" />
              <button className="command-button h-12 w-full justify-center bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60" type="submit" disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : isRegister ? <UserPlus size={18} /> : <LogOut size={18} className="rotate-180" />}
                {isRegister ? "Create account" : "Login"}
              </button>
            </form>
            <button className="mt-5 w-full text-center text-sm font-semibold text-teal-600 dark:text-teal-300" onClick={() => setMode(isRegister ? "login" : "register")}>
              {isRegister ? "Already have an account? Login" : "New to FocusFlow? Create an account"}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}



function DashboardView({ activeView, data, rawData, chartOptions, runAction, setActiveView, user, updateUser, darkMode, setDarkMode }) {
  if (activeView === "tasks") return <TaskManager tasks={data.tasks} runAction={runAction} />;
  if (activeView === "assignments") return <AssignmentsCard assignments={data.assignments} runAction={runAction} />;
  if (activeView === "habits") return <HabitCard habits={data.habits} runAction={runAction} />;
  if (activeView === "calendar") return <ScheduleCard events={data.events} runAction={runAction} />;
  if (activeView === "notes") return <NotesCard notes={data.notes} runAction={runAction} />;
  if (activeView === "settings") return <SettingsPanel user={user} updateUser={updateUser} darkMode={darkMode} setDarkMode={setDarkMode} />;

  const activityData = {
    labels: ["Completed", "Pending", "Assignments", "Habits", "Pomodoros"],
    datasets: [
      {
        label: "Activity",
        data: [rawData.summary.completedTasks, rawData.summary.pendingTasks, rawData.summary.upcomingAssignments, rawData.habits.length, rawData.summary.pomodoros],
        borderColor: "#14b8a6",
        backgroundColor: "rgba(20,184,166,.14)",
        fill: true,
        tension: 0.4
      }
    ]
  };
  const taskSplitData = {
    labels: ["Completed", "Pending"],
    datasets: [{ data: [rawData.summary.completedTasks, rawData.summary.pendingTasks], backgroundColor: ["#14b8a6", "#f59e0b"], borderWidth: 0 }]
  };

  return (
    <>
      <Hero setActiveView={setActiveView} runAction={runAction} summary={rawData.summary} />
      <StatsGrid summary={rawData.summary} habits={rawData.habits} tasks={rawData.tasks} />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_.9fr]">
        <div className="space-y-6">
          <TaskManager tasks={data.tasks.slice(0, 4)} runAction={runAction} compact />
          <AnalyticsPanel chartOptions={chartOptions} activityData={activityData} taskSplitData={taskSplitData} habits={rawData.habits} />
        </div>
        <div className="space-y-6">
          <PomodoroCard runAction={runAction} />
          <ScheduleCard events={data.events.slice(0, 4)} runAction={runAction} compact />
          <HabitCard habits={data.habits.slice(0, 4)} runAction={runAction} compact />
        </div>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AssignmentsCard assignments={data.assignments.slice(0, 4)} runAction={runAction} compact />
        <NotesCard notes={data.notes.slice(0, 6)} runAction={runAction} compact />
      </div>
    </>
  );
}

function Sidebar({ activeView, setActiveView, summary, mobile = false, onClose }) {
  return (
    <aside className={`${mobile ? "block h-full" : "hidden lg:block"} border-r border-slate-200/80 bg-white/90 px-5 py-6 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95`}>
      <div className="flex items-center justify-between gap-3">
        <BrandMark />
        {mobile ? <button className="icon-button" title="Close navigation" onClick={onClose}><X size={18} /></button> : null}
      </div>
      <nav className="mt-8 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.value}
            className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition ${
              activeView === item.value ? "bg-slate-950 text-white shadow-soft dark:bg-teal-500 dark:text-slate-950" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            }`}
            onClick={() => {
              setActiveView(item.value);
              onClose?.();
            }}
            title={item.label}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-8 rounded-lg border border-teal-200/70 bg-teal-50 p-4 dark:border-teal-400/20 dark:bg-teal-400/10">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Target size={18} className="text-amber-500" />
          Productivity Score
        </div>
        <p className="text-3xl font-black">{summary.productivityScore}</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Built from completed tasks, study time, and finished focus sessions.</p>
      </div>
    </aside>
  );
}

function TopBar({ darkMode, setDarkMode, user, onLogout, query, setQuery, setActiveView, onOpenNav, onNotify }) {
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 border-b border-slate-200/70 bg-stone-50/90 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <button className="icon-button lg:hidden" title="Open navigation" onClick={onOpenNav}><Menu size={18} /></button>
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900 sm:w-[440px]">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search tasks, notes, habits..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button className="icon-button" title="Add task" onClick={() => setActiveView("tasks")}><Plus size={18} /></button>
          <button className="icon-button" title="Notifications" onClick={onNotify}><Bell size={18} /></button>
          <button className="icon-button" title="Toggle theme" onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button className="hidden h-10 items-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold shadow-sm dark:bg-slate-900 sm:flex" title={user.email} onClick={() => setActiveView("settings")}>
            <User size={18} />
            <span className="max-w-32 truncate">{user.name}</span>
          </button>
          <button className="icon-button" title="Logout" onClick={onLogout}><LogOut size={18} /></button>
        </div>
      </div>
    </header>
  );
}

function Hero({ setActiveView, runAction, summary }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-lg bg-slate-950 text-white shadow-soft">
      <div className="grid gap-5 bg-[linear-gradient(135deg,rgba(20,184,166,.26),transparent_38%),linear-gradient(45deg,rgba(245,158,11,.18),transparent_32%)] p-5 md:grid-cols-[1fr_300px] md:p-7">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[.18em] text-teal-300">Today in FocusFlow</p>
          <h2 className="max-w-2xl text-3xl font-black leading-tight sm:text-4xl">Plan the next move, then protect the next focus block.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">A working productivity cockpit with live CRUD, real analytics, a usable timer, searchable notes, and responsive navigation.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="command-button bg-teal-500 text-slate-950 hover:bg-teal-400" onClick={() => runAction(() => pomodoroApi.create({ subject: "Quick focus", focusMinutes: 25, breakMinutes: 5 }), "Focus session saved.")}>
              <Play size={18} />
              Quick Focus
            </button>
            <button className="command-button bg-white/10 text-white hover:bg-white/15" onClick={() => setActiveView("tasks")}>
              <ListChecks size={18} />
              Plan Tasks
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MiniMetric label="Score" value={summary.productivityScore} />
          <MiniMetric label="Done" value={summary.completedTasks} />
          <MiniMetric label="Study" value={`${summary.studyHours}h`} />
          <MiniMetric label="Focus" value={summary.pomodoros} />
        </div>
      </div>
    </motion.section>
  );
}

function StatsGrid({ summary, habits, tasks }) {
  const dueToday = tasks.filter((task) => isToday(task.dueDate) && task.status !== "completed").length;
  const stats = [
    { label: "Productivity score", value: summary.productivityScore, delta: "Live", tone: "teal" },
    { label: "Study hours", value: summary.studyHours, delta: "Tracked", tone: "rose" },
    { label: "Due today", value: dueToday, delta: `${summary.pendingTasks} open`, tone: "amber" },
    { label: "Best streak", value: habits.reduce((max, habit) => Math.max(max, habit.streak || 0), 0), delta: "Habits", tone: "sky" }
  ];
  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.label} className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${toneClasses[stat.tone]}`}>{stat.delta}</span>
          </div>
          <p className="mt-4 text-3xl font-black">{stat.value}</p>
        </article>
      ))}
    </section>
  );
}

function TaskManager({ tasks, runAction, compact = false }) {
  const [form, setForm] = useState({ title: "", category: "", description: "", dueDate: "", priority: "medium", recurring: false, frequency: "weekly" });
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("due");
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState({});

  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((task) => filter === "all" || task.status === filter || task.priority === filter);
    return [...filtered].sort((a, b) => {
      if (sort === "priority") return priorityWeight(b.priority) - priorityWeight(a.priority);
      if (sort === "progress") return (b.progress || 0) - (a.progress || 0);
      return new Date(a.dueDate || "2999-12-31") - new Date(b.dueDate || "2999-12-31");
    });
  }, [tasks, filter, sort]);

  function submitTask(event) {
    event.preventDefault();
    runAction(
      () => tasksApi.create({ ...form, status: "todo", progress: 0, dueDate: form.dueDate || undefined, recurring: { enabled: form.recurring, frequency: form.frequency } }),
      "Task created."
    );
    setForm({ title: "", category: "", description: "", dueDate: "", priority: "medium", recurring: false, frequency: "weekly" });
  }

  function startEdit(task) {
    setEditingId(task._id);
    setDraft({ title: task.title, category: task.category || "", description: task.description || "", dueDate: toDateInput(task.dueDate), priority: task.priority, progress: task.progress || 0 });
  }

  return (
    <section className="panel p-5">
      <SectionHeader icon={ListChecks} title="Task Manager" action={compact ? null : `${visibleTasks.length} visible`} />
      {!compact ? (
        <>
          <form className="mt-4 grid gap-3" onSubmit={submitTask}>
            <div className="grid gap-3 md:grid-cols-[1.2fr_.9fr_160px_140px]">
              <TextInput value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Task title" required />
              <TextInput value={form.category} onChange={(value) => setForm({ ...form, category: value })} placeholder="Subject/category" />
              <input className="field" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
              <SelectField value={form.priority} onChange={(value) => setForm({ ...form, priority: value })} options={["low", "medium", "high"]} />
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_170px_150px_auto]">
              <TextInput value={form.description} onChange={(value) => setForm({ ...form, description: value })} placeholder="Description or next step" />
              <label className="toggle-row"><input type="checkbox" checked={form.recurring} onChange={(event) => setForm({ ...form, recurring: event.target.checked })} />Recurring</label>
              <SelectField value={form.frequency} onChange={(value) => setForm({ ...form, frequency: value })} options={["daily", "weekly", "monthly"]} disabled={!form.recurring} />
              <button className="command-button justify-center bg-teal-600 text-white hover:bg-teal-700" type="submit"><Save size={18} />Save</button>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            <SelectField value={filter} onChange={setFilter} options={["all", "todo", "in-progress", "completed", "high", "medium", "low"]} />
            <SelectField value={sort} onChange={setSort} options={["due", "priority", "progress"]} />
          </div>
        </>
      ) : null}
      <div className="mt-4 space-y-3">
        {visibleTasks.length ? visibleTasks.map((task) => (
          <article key={task._id} className="rounded-lg border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800">
            {editingId === task._id ? (
              <div className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <TextInput value={draft.title} onChange={(value) => setDraft({ ...draft, title: value })} placeholder="Task title" required />
                  <TextInput value={draft.category} onChange={(value) => setDraft({ ...draft, category: value })} placeholder="Category" />
                </div>
                <TextInput value={draft.description} onChange={(value) => setDraft({ ...draft, description: value })} placeholder="Description" />
                <div className="grid gap-3 md:grid-cols-[160px_140px_1fr_auto]">
                  <input className="field" type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} />
                  <SelectField value={draft.priority} onChange={(value) => setDraft({ ...draft, priority: value })} options={["low", "medium", "high"]} />
                  <label className="flex items-center gap-3 text-sm font-semibold">Progress<input className="w-full accent-teal-600" type="range" min="0" max="100" value={draft.progress} onChange={(event) => setDraft({ ...draft, progress: Number(event.target.value) })} />{draft.progress}%</label>
                  <button className="command-button justify-center bg-teal-600 text-white" onClick={() => { runAction(() => tasksApi.update(task._id, { ...draft, dueDate: draft.dueDate || undefined }), "Task updated."); setEditingId(""); }}><Save size={18} />Update</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.category || "General"} {task.dueDate ? `- ${formatDate(task.dueDate)}` : ""} {task.recurring?.enabled ? `- repeats ${task.recurring.frequency}` : ""}</p>
                    {task.description ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{task.description}</p> : null}
                  </div>
                  <span className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${priorityClass(task.priority)}`}>{task.priority}</span>
                </div>
                <ProgressBar value={task.progress || 0} />
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button className="small-action" onClick={() => runAction(() => tasksApi.update(task._id, { status: "completed", progress: 100 }), "Task marked complete.")}>Complete</button>
                  <button className="small-action" onClick={() => runAction(() => tasksApi.update(task._id, { status: "in-progress", progress: Math.max(task.progress || 0, 50) }), "Task moved to in progress.")}>In progress</button>
                  <button className="small-action" onClick={() => startEdit(task)}><Edit3 size={14} />Edit</button>
                  <button className="danger-action" onClick={() => runAction(() => tasksApi.remove(task._id), "Task deleted.")}><Trash2 size={15} />Delete</button>
                </div>
              </>
            )}
          </article>
        )) : <EmptyState title="No matching tasks" text="Add a task or loosen your filters to bring work back into view." />}
      </div>
    </section>
  );
}

function AssignmentsCard({ assignments, runAction, compact = false }) {
  const [form, setForm] = useState({ title: "", subject: "", dueDate: "", priority: "medium" });
  function submitAssignment(event) {
    event.preventDefault();
    runAction(() => assignmentsApi.create({ ...form, dueDate: form.dueDate }), "Assignment created.");
    setForm({ title: "", subject: "", dueDate: "", priority: "medium" });
  }
  return (
    <section className="panel p-5">
      <SectionHeader icon={CheckCircle2} title="Assignment Tracker" action={`${assignments.length} items`} />
      {!compact ? (
        <form className="mt-4 grid gap-3 md:grid-cols-[1.4fr_1fr_180px_140px_auto]" onSubmit={submitAssignment}>
          <TextInput value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Assignment title" required />
          <TextInput value={form.subject} onChange={(value) => setForm({ ...form, subject: value })} placeholder="Subject" required />
          <input className="field" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} required />
          <SelectField value={form.priority} onChange={(value) => setForm({ ...form, priority: value })} options={["low", "medium", "high"]} />
          <button className="command-button justify-center bg-teal-600 text-white" type="submit"><Save size={18} />Save</button>
        </form>
      ) : null}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-400"><tr><th className="py-3">Assignment</th><th>Subject</th><th>Status</th><th>Due</th><th>Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {assignments.length ? assignments.map((assignment) => (
              <tr key={assignment._id}>
                <td className="py-3 font-semibold">{assignment.title}</td>
                <td>{assignment.subject}</td>
                <td><span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold dark:bg-slate-800">{assignment.status}</span></td>
                <td>{formatDate(assignment.dueDate)}</td>
                <td><div className="flex gap-2"><button className="small-action" onClick={() => runAction(() => assignmentsApi.update(assignment._id, { status: "submitted" }), "Assignment submitted.")}>Submit</button><button className="danger-action" onClick={() => runAction(() => assignmentsApi.remove(assignment._id), "Assignment deleted.")}>Delete</button></div></td>
              </tr>
            )) : <tr><td className="py-4 text-slate-500" colSpan="5">No assignments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function HabitCard({ habits, runAction, compact = false }) {
  const [name, setName] = useState("");
  function submitHabit(event) {
    event.preventDefault();
    runAction(() => habitsApi.create({ name, targetDays: [1, 2, 3, 4, 5] }), "Habit created.");
    setName("");
  }
  return (
    <section className="panel p-5">
      <SectionHeader icon={Flame} title="Habit Tracker" action={`${habits.length} active`} />
      {!compact ? <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={submitHabit}><TextInput value={name} onChange={setName} placeholder="Habit name" required /><button className="command-button justify-center bg-teal-600 text-white" type="submit"><Save size={18} />Save</button></form> : null}
      <div className="mt-4 space-y-4">
        {habits.length ? habits.map((habit) => {
          const completionRate = Math.min(100, Math.round(((habit.completions?.length || 0) / 30) * 100));
          return (
            <div key={habit._id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="mb-3 flex items-center justify-between gap-3 text-sm"><span className="font-semibold">{habit.name}</span><span className="text-slate-500">{habit.streak || 0} day streak</span></div>
              <ProgressBar value={completionRate} label={`${completionRate}% month`} />
              <div className="mt-3 flex flex-wrap gap-2"><button className="small-action" onClick={() => runAction(() => habitsApi.complete(habit._id), "Habit completed for today.")}>Done today</button><button className="danger-action" onClick={() => runAction(() => habitsApi.remove(habit._id), "Habit deleted.")}>Delete</button></div>
            </div>
          );
        }) : <EmptyState title="No habits yet" text="Create a small repeatable habit and FocusFlow will track the streak." />}
      </div>
    </section>
  );
}

function ScheduleCard({ events, runAction, compact = false }) {
  const [form, setForm] = useState({ title: "", type: "study", start: "" });
  const [view, setView] = useState("week");
  const visibleEvents = useMemo(() => {
    if (view === "month") return events;
    const end = new Date();
    end.setDate(end.getDate() + (view === "day" ? 1 : 7));
    return events.filter((event) => new Date(event.start) <= end);
  }, [events, view]);
  function submitEvent(event) {
    event.preventDefault();
    runAction(() => eventsApi.create({ ...form, start: new Date(form.start).toISOString() }), "Calendar event created.");
    setForm({ title: "", type: "study", start: "" });
  }
  return (
    <section className="panel p-5">
      <SectionHeader icon={CalendarDays} title="Calendar" action={!compact ? <ViewSwitch value={view} onChange={setView} options={["day", "week", "month"]} /> : null} />
      {!compact ? <form className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_220px_auto]" onSubmit={submitEvent}><TextInput value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Event title" required /><SelectField value={form.type} onChange={(value) => setForm({ ...form, type: value })} options={["class", "exam", "assignment", "study", "personal"]} /><input className="field" type="datetime-local" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} required /><button className="command-button justify-center bg-teal-600 text-white" type="submit"><Save size={18} />Save</button></form> : null}
      <div className="mt-4 space-y-3">
        {visibleEvents.length ? visibleEvents.map((event) => <div key={event._id} className="grid grid-cols-[72px_1fr_auto] gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900"><span className="text-sm font-semibold text-teal-600 dark:text-teal-300">{formatTime(event.start)}</span><div><p className="text-sm font-semibold">{event.title}</p><p className="text-xs text-slate-500 dark:text-slate-400">{event.type} - {formatDate(event.start)}</p></div><button className="danger-action" onClick={() => runAction(() => eventsApi.remove(event._id), "Event deleted.")}>Delete</button></div>) : <EmptyState title="No events scheduled" text="Add classes, deadlines, or focus sessions to build your calendar." />}
      </div>
    </section>
  );
}

function NotesCard({ notes, runAction, compact = false }) {
  const [form, setForm] = useState({ title: "", subject: "", content: "" });
  function submitNote(event) {
    event.preventDefault();
    runAction(() => notesApi.create(form), "Note saved.");
    setForm({ title: "", subject: "", content: "" });
  }
  return (
    <section className="panel p-5">
      <SectionHeader icon={NotebookPen} title="Notes" action={`${notes.filter((note) => note.favorite).length} pinned`} />
      {!compact ? <form className="mt-4 grid gap-3" onSubmit={submitNote}><div className="grid gap-3 md:grid-cols-2"><TextInput value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Note title" required /><TextInput value={form.subject} onChange={(value) => setForm({ ...form, subject: value })} placeholder="Subject" /></div><textarea className="field min-h-28 resize-y py-3" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Write Markdown, lecture notes, or a quick study plan..." /><button className="command-button w-fit justify-center bg-teal-600 text-white" type="submit"><Save size={18} />Save note</button></form> : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {notes.length ? [...notes].sort((a, b) => Number(b.favorite) - Number(a.favorite)).map((note) => <article key={note._id} className="rounded-lg border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold">{note.title}</p>{note.favorite ? <Pin size={16} className="shrink-0 text-amber-500" /> : null}</div><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{note.subject || "General"}</p><p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{note.content || "No content yet."}</p><div className="mt-4 flex items-center justify-between"><button className="small-action" onClick={() => runAction(() => notesApi.update(note._id, { favorite: !note.favorite }), "Note updated.")}><Star size={14} />{note.favorite ? "Unpin" : "Pin"}</button><button className="danger-action" onClick={() => runAction(() => notesApi.remove(note._id), "Note deleted.")}>Delete</button></div></article>) : <EmptyState title="No notes found" text="Capture your first note or try another search phrase." />}
      </div>
    </section>
  );
}

function PomodoroCard({ runAction }) {
  const [settings, setSettings] = useState({ subject: "Focus session", focusMinutes: 25, shortBreak: 5, longBreak: 15, autoSwitch: true });
  const [mode, setMode] = useState("focus");
  const [active, setActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(settings.focusMinutes * 60);
  const [sessionId, setSessionId] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(intervalRef.current);
          setActive(false);
          if (mode === "focus" && sessionId) {
            runAction(() => pomodoroApi.finish(sessionId), "Pomodoro session completed.");
            setSessionId("");
          }
          if (settings.autoSwitch) {
            const nextMode = mode === "focus" ? "shortBreak" : "focus";
            setMode(nextMode);
            return minutesForMode(settings, nextMode) * 60;
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(intervalRef.current);
  }, [active, mode, sessionId, settings, runAction]);

  useEffect(() => {
    if (!active) setSecondsLeft(minutesForMode(settings, mode) * 60);
  }, [settings, mode, active]);

  async function togglePomodoro() {
    if (!active && mode === "focus" && !sessionId) {
      await runAction(async () => {
        const session = await pomodoroApi.create({ subject: settings.subject, focusMinutes: settings.focusMinutes, breakMinutes: settings.shortBreak });
        setSessionId(session._id);
      }, "Pomodoro session started.");
    }
    setActive(!active);
  }

  function finishNow() {
    setActive(false);
    if (sessionId) {
      runAction(() => pomodoroApi.finish(sessionId), "Pomodoro session completed.");
      setSessionId("");
    }
    setSecondsLeft(minutesForMode(settings, mode) * 60);
  }

  return (
    <section className="panel p-5">
      <SectionHeader icon={TimerReset} title="Pomodoro Timer" action={mode === "focus" ? "Focus" : "Break"} />
      <div className="mt-5 text-center">
        <div className="mx-auto grid h-44 w-44 place-items-center rounded-full border-[12px] border-teal-500/20 bg-teal-50 dark:bg-teal-400/10"><div><p className="text-4xl font-black tabular-nums">{formatDuration(secondsLeft)}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{active ? "Running" : "Ready"}</p></div></div>
        <div className="mt-5 grid grid-cols-3 gap-2">{["focus", "shortBreak", "longBreak"].map((item) => <button key={item} className={`small-action justify-center ${mode === item ? "ring-2 ring-teal-500" : ""}`} onClick={() => setMode(item)}>{item === "focus" ? "Focus" : item === "shortBreak" ? "Short" : "Long"}</button>)}</div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3"><NumberField label="Focus" value={settings.focusMinutes} onChange={(value) => setSettings({ ...settings, focusMinutes: value })} /><NumberField label="Short" value={settings.shortBreak} onChange={(value) => setSettings({ ...settings, shortBreak: value })} /><NumberField label="Long" value={settings.longBreak} onChange={(value) => setSettings({ ...settings, longBreak: value })} /></div>
        <div className="mt-3"><TextInput value={settings.subject} onChange={(value) => setSettings({ ...settings, subject: value })} placeholder="Session subject" /></div>
        <label className="toggle-row mt-3 justify-center"><input type="checkbox" checked={settings.autoSwitch} onChange={(event) => setSettings({ ...settings, autoSwitch: event.target.checked })} />Auto switch modes</label>
        <div className="mt-5 grid grid-cols-2 gap-3"><button className="command-button justify-center bg-teal-600 text-white" onClick={togglePomodoro}><Play size={18} />{active ? "Pause" : "Start"}</button><button className="command-button justify-center bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" onClick={finishNow}><RotateCcw size={18} />Finish</button></div>
      </div>
    </section>
  );
}

function AnalyticsPanel({ chartOptions, activityData, taskSplitData, habits }) {
  const habitBars = {
    labels: habits.slice(0, 6).map((habit) => habit.name),
    datasets: [{ data: habits.slice(0, 6).map((habit) => habit.streak || 0), backgroundColor: "#14b8a6", borderRadius: 8 }]
  };
  return (
    <section className="panel p-5">
      <SectionHeader icon={PieChart} title="Analytics Dashboard" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="h-72"><Line data={activityData} options={chartOptions} /></div>
        <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-slate-200 p-4 dark:border-slate-800"><div className="h-40 w-40"><Doughnut data={taskSplitData} options={{ maintainAspectRatio: false, cutout: "72%", plugins: { legend: { display: false } } }} /></div><p className="mt-4 text-sm font-semibold">Task completion mix</p></div>
      </div>
      {habits.length ? <div className="mt-5 h-52"><Bar data={habitBars} options={chartOptions} /></div> : null}
    </section>
  );
}

function SettingsPanel({ user, updateUser, darkMode, setDarkMode }) {
  const [form, setForm] = useState({ name: user.name, notifications: user.preferences?.notifications ?? true, dailyGoalHours: user.preferences?.dailyGoalHours ?? 3, theme: darkMode ? "dark" : "light" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  async function saveSettings(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const { user: nextUser } = await authApi.updateMe({ name: form.name, preferences: { notifications: form.notifications, dailyGoalHours: Number(form.dailyGoalHours), theme: form.theme } });
      await updateUser(nextUser);
      setMessage("Settings saved.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="panel p-5">
      <SectionHeader icon={Settings} title="Settings" />
      {message ? <StatusMessage message={message} /> : null}
      <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={saveSettings}>
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"><h3 className="font-semibold">Profile</h3><div className="mt-4 space-y-3"><TextInput value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="Display name" required /><p className="text-sm text-slate-500">{user.email}</p></div></div>
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"><h3 className="font-semibold">Preferences</h3><div className="mt-4 space-y-3"><SelectField value={form.theme} onChange={(value) => { setForm({ ...form, theme: value }); setDarkMode(value === "dark"); }} options={["light", "dark"]} /><NumberField label="Daily goal hours" value={form.dailyGoalHours} onChange={(value) => setForm({ ...form, dailyGoalHours: value })} /><label className="toggle-row"><input type="checkbox" checked={form.notifications} onChange={(event) => setForm({ ...form, notifications: event.target.checked })} />Workspace notifications</label></div></div>
        <button className="command-button w-fit justify-center bg-teal-600 text-white disabled:opacity-60" type="submit" disabled={saving}>{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}Save settings</button>
      </form>
    </section>
  );
}

const toneClasses = {
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300"
};

function SectionHeader({ icon: Icon, title, action }) {
  return <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300"><Icon size={18} /></div><h2 className="text-lg font-bold">{title}</h2></div>{action ? <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{action}</div> : null}</div>;
}

function BrandMark({ inverse = false }) {
  return <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-500 text-slate-950 shadow-soft"><Sparkles size={22} /></div><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-teal-500 dark:text-teal-300">Premium Study OS</p><h1 className={`text-xl font-black ${inverse ? "text-white" : "text-slate-950 dark:text-white"}`}>FocusFlow</h1></div></div>;
}

function FormInput({ icon: Icon, label, ...inputProps }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span><span className="auth-input"><Icon size={18} /><input {...inputProps} /></span></label>;
}

function TextInput({ value, onChange, ...props }) {
  return <input className="field" value={value} onChange={(event) => onChange(event.target.value)} {...props} />;
}

function SelectField({ value, onChange, options, disabled = false }) {
  return <label className="relative min-w-0"><select className="field appearance-none pr-9 capitalize" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /></label>;
}

function NumberField({ label, value, onChange }) {
  return <label className="block text-left text-xs font-semibold text-slate-500 dark:text-slate-400">{label}<input className="field mt-1" type="number" min="1" max="180" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function ViewSwitch({ value, onChange, options }) {
  return <div className="rounded-lg bg-slate-100 p-1 dark:bg-slate-900">{options.map((option) => <button key={option} className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition ${value === option ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500"}`} onClick={() => onChange(option)}>{option}</button>)}</div>;
}

function ProgressBar({ value, label }) {
  return <div className="mt-4"><div className="mb-1 flex justify-between text-xs font-semibold text-slate-500"><span>{label || "Progress"}</span><span>{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div></div>;
}

function MiniMetric({ label, value }) {
  return <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/10"><p className="text-xs text-slate-300">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>;
}

function StatusMessage({ message, tone = "info", onDismiss }) {
  return <div className={`mb-4 flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium ${tone === "error" ? "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300" : "bg-teal-100 text-teal-800 dark:bg-teal-400/15 dark:text-teal-200"}`}><span>{message}</span>{onDismiss ? <button title="Dismiss" onClick={onDismiss}><X size={16} /></button> : null}</div>;
}

function LoadingStrip() {
  return <div className="mb-4 flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:bg-slate-900"><Loader2 size={16} className="animate-spin text-teal-600" />Loading your workspace...</div>;
}

function EmptyState({ title, text }) {
  return <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm dark:border-slate-700"><p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p><p className="mt-1 text-slate-500 dark:text-slate-400">{text}</p></div>;
}

function priorityWeight(priority) {
  return { low: 1, medium: 2, high: 3 }[priority] || 0;
}

function priorityClass(priority) {
  if (priority === "high") return "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300";
  if (priority === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300";
  return "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300";
}

function minutesForMode(settings, mode) {
  if (mode === "longBreak") return settings.longBreak;
  if (mode === "shortBreak") return settings.shortBreak;
  return settings.focusMinutes;
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

export default App;