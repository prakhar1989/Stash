import { AddTodoForm } from "app/add-todo";
import { Header } from "app/header";
import { TodoList } from "app/todo-list";

import { UsersStats } from "app/users-stats";
import { stackServerApp } from "app/stack";

export default async function Home() {
  const user = await stackServerApp.getUser();

  let content = null;
  if (user) {
    content = (
      <main className="mx-auto w-full flex-1 max-w-6xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="space-y-6">
            <AddTodoForm />
            <TodoList />
          </div>
          <div className="lg:sticky lg:top-24">
            <UsersStats />
          </div>
        </div>
      </main>
    );
  } else {
    content = (
      <main className="mx-auto w-full flex-1 max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-dashed border-border/80 bg-background/80 px-8 py-12 text-center shadow-sm shadow-black/5">
          <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
            Welcome
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">
            Sign in to start tracking the work that matters.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Once you&apos;re authenticated you can capture todos, track the
            team, and keep everyone in sync.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      {content}
    </div>
  );
}
