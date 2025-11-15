"use server";

import { usersSync as users } from "drizzle-orm/neon";
import { todos } from "./schema/schema";
import { and, eq, isNull } from "drizzle-orm";
import { fetchWithDrizzle } from "app/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function getUserStats() {
  const stats = await fetchWithDrizzle((db) =>
    db
      .select({
        email: users.email,
        name: users.name,
        complete: db.$count(
          todos,
          and(eq(todos.isComplete, true), eq(todos.ownerId, users.id)),
        ),
        total: db.$count(todos, eq(todos.ownerId, users.id)),
      })
      .from(users)
      .innerJoin(todos, eq(todos.ownerId, users.id))
      .where(isNull(users.deletedAt))
      .groupBy(users.email, users.name, users.id),
  );

  return stats;
}

export async function UsersStats() {
  const stats = await getUserStats();

  if (stats.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg shadow-primary/5">
      <CardHeader>
        <CardTitle>Team progress</CardTitle>
        <CardDescription>
          A quick look at how everyone is moving their tasks forward.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((user) => {
          const completionRate =
            user.total === 0
              ? 0
              : Math.round((user.complete / user.total) * 100);

          return (
            <div
              key={user.email}
              className="rounded-2xl border border-border/80 bg-white/70 p-4 shadow-sm shadow-black/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {user.name ?? "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-right text-sm font-semibold text-foreground">
                  {user.complete}/{user.total}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    done
                  </span>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/70"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                {completionRate}% complete
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
