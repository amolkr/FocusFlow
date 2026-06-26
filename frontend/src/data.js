export const stats = [
  { label: "Productivity score", value: "86", delta: "+12%", tone: "mint" },
  { label: "Study hours", value: "18.5", delta: "+4.2h", tone: "coral" },
  { label: "Tasks done", value: "27", delta: "9 pending", tone: "saffron" },
  { label: "Habit streak", value: "14", delta: "days", tone: "blue" }
];

export const tasks = [
  { title: "Finish DBMS lab record", subject: "Database Systems", due: "Today, 6:00 PM", priority: "High", progress: 72 },
  { title: "Revise calculus integration", subject: "Mathematics", due: "Tomorrow", priority: "Medium", progress: 48 },
  { title: "Read OS scheduling chapter", subject: "Operating Systems", due: "Fri", priority: "Low", progress: 35 }
];

export const assignments = [
  { name: "Machine learning mini project", subject: "AI", status: "Drafting", date: "Jun 28", priority: "High" },
  { name: "Economics case study", subject: "Economics", status: "Research", date: "Jul 02", priority: "Medium" },
  { name: "Physics worksheet", subject: "Physics", status: "Submitted", date: "Jul 05", priority: "Low" }
];

export const habits = [
  { name: "Morning revision", streak: 14, rate: 92 },
  { name: "Workout", streak: 8, rate: 76 },
  { name: "No late scrolling", streak: 5, rate: 68 }
];

export const notes = [
  { title: "Binary search patterns", subject: "DSA", favorite: true },
  { title: "Thermodynamics formulas", subject: "Physics", favorite: false },
  { title: "Essay outline", subject: "English", favorite: true }
];

export const calendarEvents = [
  { time: "09:00", title: "Algorithms lecture", type: "Class" },
  { time: "13:30", title: "Group project sync", type: "Study" },
  { time: "18:00", title: "DBMS submission", type: "Deadline" }
];

export const weeklyStudyData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Focused hours",
      data: [2.5, 3.2, 1.8, 4.1, 2.6, 3.8, 0.5],
      borderColor: "#2fbf9a",
      backgroundColor: "rgba(47, 191, 154, 0.14)",
      fill: true,
      tension: 0.42
    }
  ]
};

export const taskSplitData = {
  labels: ["Completed", "In progress", "Blocked"],
  datasets: [
    {
      data: [62, 28, 10],
      backgroundColor: ["#2fbf9a", "#f4b740", "#ff7a59"],
      borderWidth: 0
    }
  ]
};
