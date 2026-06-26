import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  Home,
  ListChecks,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Moon,
  NotebookPen,
  PieChart,
  Play,
  Plus,
  Save,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  TimerReset,
  Trash2,
  User,
  UserPlus
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { useEffect, useMemo, useState } from "react";
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

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const navItems = [
  { label: "Dashboard", value: "dashboard", icon: Home },
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

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [session, setSession] = useState(getStoredSession);
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState({
    tasks: [],
    assignments: [],
    habits: [],
    notes: [],
    events: [],
    pomodoros: [],
    summary: emptySummary
  });

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: darkMode ? "#cbd5e1" : "#64748b" } },
        y: {
          grid: { color: darkMode ? "rgba(148, 163, 184, 0.18)" : "rgba(100, 116, 139, 0.16)" },
          ticks: { color: darkMode ? "#cbd5e1" : "#64748b" }
        }
      }
    }),
    [darkMode]
  );

  useEffect(() => {
    if (session?.token) {
      loadDashboard();
    }
    // loadDashboard is intentionally called only when the saved auth token changes.
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
      if (error.message.toLowerCase().includes("token")) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }

  function handleAuth(nextSession) {
    saveSession(nextSession);
    setSession(nextSession);
    setNotice("Logged in successfully.");
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setData({ tasks: [], assignments: [], habits: [], notes: [], events: [], pomodoros: [], summary: emptySummary });
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

  const filteredNotes = data.notes.filter((note) => `${note.title} ${note.subject} ${note.content}`.toLowerCase().includes(query.toLowerCase()));
  const filteredTasks = data.tasks.filter((task) => `${task.title} ${task.category} ${task.description}`.toLowerCase().includes(query.toLowerCase()));

  const weeklyStudyData = {
    labels: ["Tasks", "Assignments", "Habits", "Pomodoros"],
    datasets: [
      {
        label: "Activity",
        data: [data.summary.completedTasks, data.summary.upcomingAssignments, data.habits.length, data.summary.pomodoros],
        borderColor: "#2fbf9a",
        backgroundColor: "rgba(47, 191, 154, 0.14)",
        fill: true,
        tension: 0.42
      }
    ]
  };

  const taskSplitData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [data.summary.completedTasks, data.summary.pendingTasks],
        backgroundColor: ["#2fbf9a", "#f4b740"],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <main className="min-h-screen bg-[#f6f8f6] text-ink transition-colors dark:bg-[#111827] dark:text-slate-100">
        {session ? (
          <div className="mx-auto grid min-h-screen max-w-[1520px] grid-cols-1 lg:grid-cols-[260px_1fr]">
            <Sidebar activeView={activeView} setActiveView={setActiveView} summary={data.summary} />
            <section className="min-w-0 px-4 py-4 sm:px-6 lg:px-8">
              <TopBar
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                user={session.user}
                onLogout={handleLogout}
                query={query}
                setQuery={setQuery}
                setActiveView={setActiveView}
              />
              {notice ? <StatusMessage message={notice} /> : null}
              {loading ? <LoadingStrip /> : null}
              <DashboardView
                activeView={activeView}
                data={{ ...data, tasks: filteredTasks, notes: filteredNotes }}
                chartOptions={chartOptions}
                weeklyStudyData={weeklyStudyData}
                taskSplitData={taskSplitData}
                runAction={runAction}
                setActiveView={setActiveView}
              />
            </section>
          </div>
        ) : (
          <AuthPage darkMode={darkMode} setDarkMode={setDarkMode} onAuth={handleAuth} />
        )}
      </main>
    </div>
  );
}

function AuthPage({ darkMode, setDarkMode, onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isRegister = mode === "register";

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const session = isRegister ? await authApi.register(payload) : await authApi.login(payload);
      onAuth(session);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex min-h-[42vh] flex-col justify-between bg-ink p-6 text-white sm:p-10 lg:min-h-screen">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-mint text-white shadow-soft">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">Student</p>
              <h1 className="text-xl font-bold">Productivity Hub</h1>
            </div>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 transition hover:bg-white/15" title="Toggle theme" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <div className="my-10 max-w-2xl">
          <p className="mb-3 text-sm font-semibold text-mint">Plan, study, track, repeat</p>
          <h2 className="text-4xl font-bold leading-tight sm:text-5xl">Bring your academic day into one calm workspace.</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
            Create a real account, save your work in MongoDB, and manage your study life from one responsive dashboard.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <AuthMetric label="Tasks" value="CRUD" />
          <AuthMetric label="Auth" value="JWT" />
          <AuthMetric label="Deploy" value="Ready" />
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-6 inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button className={`segmented ${mode === "login" ? "segmented-active" : ""}`} onClick={() => setMode("login")}>
              Login
            </button>
            <button className={`segmented ${mode === "register" ? "segmented-active" : ""}`} onClick={() => setMode("register")}>
              Register
            </button>
          </div>
          <div className="panel p-6 sm:p-7">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{isRegister ? "Create your account" : "Welcome back"}</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {isRegister ? "Your account will be saved in MongoDB." : "Login using your saved account."}
              </p>
            </div>
            {error ? <StatusMessage message={error} tone="error" /> : null}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {isRegister ? (
                <FormInput icon={User} label="Full name" name="name" value={form.name} onChange={updateField} required placeholder="Your name" />
              ) : null}
              <FormInput icon={Mail} label="Email address" name="email" type="email" value={form.email} onChange={updateField} required placeholder="you@example.com" />
              <FormInput icon={Lock} label="Password" name="password" type="password" value={form.password} onChange={updateField} required minLength={6} placeholder="Minimum 6 characters" />
              <button className="command-button h-12 w-full justify-center bg-mint text-white disabled:opacity-60" type="submit" disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : isRegister ? <UserPlus size={18} /> : <LogOut size={18} className="rotate-180" />}
                {isRegister ? "Create account" : "Login"}
              </button>
            </form>
            <button className="mt-5 w-full text-center text-sm font-semibold text-mint" onClick={() => setMode(isRegister ? "login" : "register")}>
              {isRegister ? "Already have an account? Login" : "New student? Create an account"}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function DashboardView({ activeView, data, chartOptions, weeklyStudyData, taskSplitData, runAction, setActiveView }) {
  if (activeView === "tasks") return <TaskManager tasks={data.tasks} runAction={runAction} />;
  if (activeView === "assignments") return <AssignmentsCard assignments={data.assignments} runAction={runAction} />;
  if (activeView === "habits") return <HabitCard habits={data.habits} runAction={runAction} />;
  if (activeView === "calendar") return <ScheduleCard events={data.events} runAction={runAction} />;
  if (activeView === "notes") return <NotesCard notes={data.notes} runAction={runAction} />;
  if (activeView === "settings") return <SettingsPanel />;

  return (
    <>
      <Hero setActiveView={setActiveView} runAction={runAction} />
      <StatsGrid summary={data.summary} />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-6">
          <TaskManager tasks={data.tasks.slice(0, 4)} runAction={runAction} compact />
          <AnalyticsPanel chartOptions={chartOptions} weeklyStudyData={weeklyStudyData} taskSplitData={taskSplitData} />
        </div>
        <div className="space-y-6">
          <PomodoroCard runAction={runAction} />
          <ScheduleCard events={data.events.slice(0, 4)} runAction={runAction} compact />
          <HabitCard habits={data.habits.slice(0, 4)} runAction={runAction} compact />
        </div>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AssignmentsCard assignments={data.assignments.slice(0, 4)} runAction={runAction} compact />
        <NotesCard notes={data.notes.slice(0, 6)} runAction={runAction} compact />
      </div>
    </>
  );
}

function Sidebar({ activeView, setActiveView, summary }) {
  return (
    <aside className="hidden border-r border-slate-200/80 bg-white/85 px-5 py-6 backdrop-blur dark:border-slate-700 dark:bg-slate-950/70 lg:block">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-mint text-white shadow-soft">
          <Sparkles size={22} />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Student</p>
          <h1 className="text-xl font-bold">Productivity Hub</h1>
        </div>
      </div>
      <nav className="mt-8 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.value}
            className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition ${
              activeView === item.value
                ? "bg-ink text-white shadow-soft dark:bg-mint"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
            onClick={() => setActiveView(item.value)}
            title={item.label}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-8 rounded-lg border border-slate-200 bg-skyglass p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Target size={18} className="text-coral" />
          Productivity Score
        </div>
        <p className="text-3xl font-bold">{summary.productivityScore}</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Calculated from completed tasks, study time, and Pomodoro sessions.</p>
      </div>
    </aside>
  );
}

function TopBar({ darkMode, setDarkMode, user, onLogout, query, setQuery, setActiveView }) {
  return (
    <header className="sticky top-0 z-20 -mx-4 mb-4 border-b border-slate-200/70 bg-[#f6f8f6]/90 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-[#111827]/90 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900 sm:w-[420px]">
          <Search size={18} className="shrink-0 text-slate-400" />
          <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search tasks and notes..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <button className="icon-button" title="Add task" onClick={() => setActiveView("tasks")}>
            <Plus size={18} />
          </button>
          <button className="icon-button" title="Notifications">
            <Bell size={18} />
          </button>
          <button className="icon-button" title="Toggle theme" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="flex h-10 items-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold shadow-sm dark:bg-slate-900" title={user.email}>
            <User size={18} />
            {user.name}
          </button>
          <button className="icon-button" title="Logout" onClick={onLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ setActiveView, runAction }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-lg bg-ink text-white shadow-soft">
      <div className="grid gap-5 p-5 md:grid-cols-[1fr_280px] md:p-7">
        <div>
          <p className="mb-2 text-sm font-semibold text-mint">Live workspace</p>
          <h2 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">Your dashboard now saves real data.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Create tasks, assignments, habits, notes, events, and Pomodoro sessions. Everything is stored through the backend API.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="command-button bg-mint text-white" onClick={() => runAction(() => pomodoroApi.create({ subject: "General study", focusMinutes: 25, breakMinutes: 5 }), "Pomodoro session started.")}>
              <Play size={18} />
              Start Focus
            </button>
            <button className="command-button bg-white/10 text-white hover:bg-white/15" onClick={() => setActiveView("assignments")}>
              <CheckCircle2 size={18} />
              Add Assignment
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MiniMetric label="Tasks" value="CRUD" />
          <MiniMetric label="Notes" value="Search" />
          <MiniMetric label="Auth" value="JWT" />
          <MiniMetric label="DB" value="Mongo" />
        </div>
      </div>
    </motion.section>
  );
}

function StatsGrid({ summary }) {
  const stats = [
    { label: "Productivity score", value: summary.productivityScore, delta: "Live", tone: "mint" },
    { label: "Study hours", value: summary.studyHours, delta: "Tracked", tone: "coral" },
    { label: "Pending tasks", value: summary.pendingTasks, delta: `${summary.completedTasks} done`, tone: "saffron" },
    { label: "Pomodoros", value: summary.pomodoros, delta: "Focus", tone: "blue" }
  ];

  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.label} className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${toneClasses[stat.tone]}`}>{stat.delta}</span>
          </div>
          <p className="mt-4 text-3xl font-bold">{stat.value}</p>
        </article>
      ))}
    </section>
  );
}

const toneClasses = {
  mint: "bg-mint/12 text-mint",
  coral: "bg-coral/12 text-coral",
  saffron: "bg-saffron/18 text-amber-700",
  blue: "bg-cyan-100 text-cyan-700"
};

function TaskManager({ tasks, runAction, compact = false }) {
  const [form, setForm] = useState({ title: "", category: "", dueDate: "", priority: "medium" });

  function submitTask(event) {
    event.preventDefault();
    runAction(
      () => tasksApi.create({ ...form, status: "todo", progress: 0, dueDate: form.dueDate || undefined }),
      "Task created."
    );
    setForm({ title: "", category: "", dueDate: "", priority: "medium" });
  }

  return (
    <section className="panel p-5">
      <SectionHeader icon={ListChecks} title="Task Manager" />
      {!compact ? (
        <form className="mt-4 grid gap-3 md:grid-cols-[1.4fr_1fr_180px_140px_auto]" onSubmit={submitTask}>
          <TextInput value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Task title" required />
          <TextInput value={form.category} onChange={(value) => setForm({ ...form, category: value })} placeholder="Subject/category" />
          <input className="field" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
          <select className="field" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button className="command-button justify-center bg-mint text-white" type="submit">
            <Save size={18} />
            Save
          </button>
        </form>
      ) : null}
      <div className="mt-4 space-y-3">
        {tasks.length ? tasks.map((task) => (
          <article key={task._id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.category || "General"} {task.dueDate ? `- ${formatDate(task.dueDate)}` : ""}</p>
              </div>
              <span className="w-fit rounded-md bg-coral/10 px-2 py-1 text-xs font-semibold text-coral">{task.priority}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button className="small-action" onClick={() => runAction(() => tasksApi.update(task._id, { status: "completed", progress: 100 }), "Task marked complete.")}>Complete</button>
              <button className="small-action" onClick={() => runAction(() => tasksApi.update(task._id, { status: "in-progress", progress: 50 }), "Task moved to in progress.")}>In progress</button>
              <button className="danger-action" onClick={() => runAction(() => tasksApi.remove(task._id), "Task deleted.")}>
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </article>
        )) : <EmptyState text="No tasks yet. Add your first task." />}
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
      <SectionHeader icon={CheckCircle2} title="Assignment Tracker" />
      {!compact ? (
        <form className="mt-4 grid gap-3 md:grid-cols-[1.4fr_1fr_180px_140px_auto]" onSubmit={submitAssignment}>
          <TextInput value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Assignment title" required />
          <TextInput value={form.subject} onChange={(value) => setForm({ ...form, subject: value })} placeholder="Subject" required />
          <input className="field" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} required />
          <select className="field" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button className="command-button justify-center bg-mint text-white" type="submit">
            <Save size={18} />
            Save
          </button>
        </form>
      ) : null}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-400">
            <tr>
              <th className="py-3">Assignment</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Due</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {assignments.length ? assignments.map((assignment) => (
              <tr key={assignment._id}>
                <td className="py-3 font-semibold">{assignment.title}</td>
                <td>{assignment.subject}</td>
                <td>{assignment.status}</td>
                <td>{formatDate(assignment.dueDate)}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="small-action" onClick={() => runAction(() => assignmentsApi.update(assignment._id, { status: "submitted" }), "Assignment submitted.")}>Submit</button>
                    <button className="danger-action" onClick={() => runAction(() => assignmentsApi.remove(assignment._id), "Assignment deleted.")}>Delete</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td className="py-4 text-slate-500" colSpan="5">No assignments yet.</td>
              </tr>
            )}
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
      <SectionHeader icon={Flame} title="Habit Tracker" />
      {!compact ? (
        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={submitHabit}>
          <TextInput value={name} onChange={setName} placeholder="Habit name" required />
          <button className="command-button justify-center bg-mint text-white" type="submit">
            <Save size={18} />
            Save
          </button>
        </form>
      ) : null}
      <div className="mt-4 space-y-4">
        {habits.length ? habits.map((habit) => (
          <div key={habit._id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <div className="mb-3 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{habit.name}</span>
              <span className="text-slate-500">{habit.streak} days</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="small-action" onClick={() => runAction(() => habitsApi.complete(habit._id), "Habit completed for today.")}>Done today</button>
              <button className="danger-action" onClick={() => runAction(() => habitsApi.update(habit._id, { active: false }), "Habit archived.")}>Archive</button>
            </div>
          </div>
        )) : <EmptyState text="No habits yet. Add one you want to repeat." />}
      </div>
    </section>
  );
}

function ScheduleCard({ events, runAction, compact = false }) {
  const [form, setForm] = useState({ title: "", type: "study", start: "" });

  function submitEvent(event) {
    event.preventDefault();
    runAction(() => eventsApi.create({ ...form, start: new Date(form.start).toISOString() }), "Calendar event created.");
    setForm({ title: "", type: "study", start: "" });
  }

  return (
    <section className="panel p-5">
      <SectionHeader icon={CalendarDays} title="Calendar" />
      {!compact ? (
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_220px_auto]" onSubmit={submitEvent}>
          <TextInput value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Event title" required />
          <select className="field" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option value="class">Class</option>
            <option value="exam">Exam</option>
            <option value="assignment">Assignment</option>
            <option value="study">Study</option>
            <option value="personal">Personal</option>
          </select>
          <input className="field" type="datetime-local" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} required />
          <button className="command-button justify-center bg-mint text-white" type="submit">
            <Save size={18} />
            Save
          </button>
        </form>
      ) : null}
      <div className="mt-4 space-y-3">
        {events.length ? events.map((event) => (
          <div key={event._id} className="grid grid-cols-[72px_1fr_auto] gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <span className="text-sm font-semibold text-mint">{formatTime(event.start)}</span>
            <div>
              <p className="text-sm font-semibold">{event.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{event.type} - {formatDate(event.start)}</p>
            </div>
            <button className="danger-action" onClick={() => runAction(() => eventsApi.remove(event._id), "Event deleted.")}>Delete</button>
          </div>
        )) : <EmptyState text="No calendar events yet." />}
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
      <SectionHeader icon={NotebookPen} title="Notes" />
      {!compact ? (
        <form className="mt-4 grid gap-3" onSubmit={submitNote}>
          <div className="grid gap-3 md:grid-cols-2">
            <TextInput value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Note title" required />
            <TextInput value={form.subject} onChange={(value) => setForm({ ...form, subject: value })} placeholder="Subject" />
          </div>
          <textarea className="field min-h-28 resize-y py-3" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Write your note..." />
          <button className="command-button w-fit justify-center bg-mint text-white" type="submit">
            <Save size={18} />
            Save note
          </button>
        </form>
      ) : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {notes.length ? notes.map((note) => (
          <article key={note._id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-sm font-semibold">{note.title}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{note.subject || "General"}</p>
            <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{note.content || "No content yet."}</p>
            <div className="mt-4 flex items-center justify-between">
              <button className="small-action" onClick={() => runAction(() => notesApi.update(note._id, { favorite: !note.favorite }), "Note updated.")}>
                {note.favorite ? "Unfavorite" : "Favorite"}
              </button>
              <button className="danger-action" onClick={() => runAction(() => notesApi.remove(note._id), "Note deleted.")}>Delete</button>
            </div>
          </article>
        )) : <EmptyState text="No notes yet. Save your first note." />}
      </div>
    </section>
  );
}

function PomodoroCard({ runAction }) {
  const [active, setActive] = useState(false);
  const [sessionId, setSessionId] = useState("");

  async function togglePomodoro() {
    if (!active) {
      await runAction(async () => {
        const session = await pomodoroApi.create({ subject: "Focus session", focusMinutes: 25, breakMinutes: 5 });
        setSessionId(session._id);
        setActive(true);
      }, "Pomodoro session started.");
    } else {
      await runAction(async () => {
        if (sessionId) await pomodoroApi.finish(sessionId);
        setSessionId("");
        setActive(false);
      }, "Pomodoro session completed.");
    }
  }

  return (
    <section className="panel p-5">
      <SectionHeader icon={TimerReset} title="Pomodoro Timer" />
      <div className="mt-5 text-center">
        <div className="mx-auto grid h-44 w-44 place-items-center rounded-full border-[12px] border-mint/20">
          <div>
            <p className="text-4xl font-bold">{active ? "25:00" : "Ready"}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{active ? "Focus session saved" : "Start a tracked session"}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="command-button justify-center bg-mint text-white" onClick={togglePomodoro}>
            <Play size={18} />
            {active ? "Finish" : "Start"}
          </button>
          <button className="command-button justify-center bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <Clock3 size={18} />
            Break
          </button>
        </div>
      </div>
    </section>
  );
}

function AnalyticsPanel({ chartOptions, weeklyStudyData, taskSplitData }) {
  return (
    <section className="panel p-5">
      <SectionHeader icon={PieChart} title="Analytics Dashboard" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="h-72">
          <Line data={weeklyStudyData} options={chartOptions} />
        </div>
        <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <div className="h-40 w-40">
            <Doughnut data={taskSplitData} options={{ maintainAspectRatio: false, cutout: "72%", plugins: { legend: { display: false } } }} />
          </div>
          <p className="mt-4 text-sm font-semibold">Task completion mix</p>
        </div>
      </div>
    </section>
  );
}

function SettingsPanel() {
  return (
    <section className="panel p-5">
      <SectionHeader icon={Settings} title="Settings" />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="font-semibold">Deployment</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Set `VITE_API_URL` on Vercel to your Render backend URL ending in `/api`.</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="font-semibold">Database</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Set `MONGODB_URI` and `JWT_SECRET` on Render for production.</p>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-mint/12 text-mint">
          <Icon size={18} />
        </div>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
    </div>
  );
}

function FormInput({ icon: Icon, label, ...inputProps }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <span className="auth-input">
        <Icon size={18} />
        <input {...inputProps} />
      </span>
    </label>
  );
}

function TextInput({ value, onChange, ...props }) {
  return <input className="field" value={value} onChange={(event) => onChange(event.target.value)} {...props} />;
}

function AuthMetric({ label, value }) {
  return (
    <div className="rounded-lg bg-white/10 p-4">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-lg bg-white/10 p-4">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusMessage({ message, tone = "info" }) {
  return (
    <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${tone === "error" ? "bg-coral/10 text-coral" : "bg-mint/10 text-emerald-700 dark:text-mint"}`}>
      {message}
    </div>
  );
}

function LoadingStrip() {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:bg-slate-900">
      <Loader2 size={16} className="animate-spin text-mint" />
      Loading your workspace...
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">{text}</div>;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default App;
