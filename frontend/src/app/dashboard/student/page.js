import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "08:45 AM - 10:45 AM",
  "11:00 AM - 01:00 PM",
  "01:30 PM - 03:30 PM",
];

export default async function StudentDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/dashboard/admin");
  }

  // Find user's class (defaulting to FE if somehow missing, though schema handles it)
  let userClass = session.user.studentClass || "FE";

  const labAllocations = await prisma.labAllocation.findMany({
    where: {
      targetClass: userClass,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const allocationsByDay = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
  labAllocations.forEach((lab) => {
    if (allocationsByDay[lab.day]) {
      allocationsByDay[lab.day].push(lab);
    }
  });

  // Sort within days by time slot index
  Object.keys(allocationsByDay).forEach(day => {
     allocationsByDay[day].sort((a, b) => {
       return TIME_SLOTS.indexOf(a.timeRange) - TIME_SLOTS.indexOf(b.timeRange);
     });
  });

  return (
    <main className="min-h-screen bg-background border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60">
              Student Schedule
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Check your weekly ({userClass}) lab allocations at a glance.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
              {userClass} Class
            </span>
            <div className="text-sm font-medium bg-secondary/30 px-4 py-2 rounded-full border border-border/60">
              Welcome, {session.user.name}
            </div>
          </div>
        </header>

        {labAllocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 lg:p-24 bg-card/40 rounded-3xl border border-dashed border-border shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground">
              No Lab Allocations Yet
            </h2>
            <p className="text-muted-foreground mt-2 text-center max-w-sm">
              Your administrators haven't scheduled any lab sessions for your class yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-start">
            {DAYS_OF_WEEK.map((day) => {
              const dayAllocations = allocationsByDay[day] || [];
              
              return (
                <div key={day} className="flex flex-col gap-4 min-w-[220px]">
                  {/* Day Header */}
                  <div className="sticky top-0 z-10 w-full rounded-2xl bg-card border border-border/60 py-3 text-center shadow-md backdrop-blur-md">
                    <span className="text-xl font-semibold tracking-tight text-foreground">{day}</span>
                    <div className="text-xs text-muted-foreground font-medium mt-0.5">{dayAllocations.length} Sessions</div>
                  </div>

                  {/* Day Cards (Slots) */}
                  <div className="flex flex-col gap-4">
                    {dayAllocations.length === 0 ? (
                      <div className="w-full h-28 border border-dashed border-border/60 rounded-2xl flex items-center justify-center text-sm font-medium text-muted-foreground/60 bg-muted/10">
                        Free Day
                      </div>
                    ) : (
                      dayAllocations.map((lab) => (
                        <Card 
                          key={lab.id} 
                          className="group relative overflow-hidden bg-card/80 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                          <div className="bg-primary/5 px-4 py-2 border-b border-border/50 text-xs font-semibold text-primary/80 uppercase tracking-wider flex justify-between items-center">
                            Time Slot
                            <span className="text-foreground font-bold bg-background px-2.5 overflow-hidden py-1 rounded-md border border-border shadow-sm">
                              {lab.timeRange}
                            </span>
                          </div>
                          <CardHeader className="p-4 relative z-10">
                            <CardTitle className="text-lg font-semibold leading-tight mb-1">
                              {lab.subject}
                            </CardTitle>
                            <CardDescription className="text-sm font-medium text-foreground/80 flex items-center gap-1.5 pb-2">
                               <div className="w-2 h-2 rounded-full bg-primary/60"></div> {lab.labName}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
