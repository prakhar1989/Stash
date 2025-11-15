"use server";

import {
  checkOrUncheckTodoFormAction,
  deleteTodoFormAction,
  getTodos,
} from "app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, RotateCcw, Trash2 } from "lucide-react";

export async function TodoList() {
  const todos = await getTodos();

  if (todos === null) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  // Calculate the number of pending todos
  const pendingTodos = todos.filter((todo) => !todo.isComplete).length;

  return (
    <Card className="shadow-lg shadow-primary/5">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Personal queue</CardTitle>
          <CardDescription>
            Keep track of every task you're owning.
          </CardDescription>
        </div>
        <div className="rounded-2xl bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
          {pendingTodos} todo{pendingTodos !== 1 ? "s" : ""} remaining
        </div>
      </CardHeader>
      <CardContent>
        {todos.length > 0 ? (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-white/80 p-4 shadow-sm shadow-black/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-6">
                  {todo.owner?.email ? (
                    <div className="text-xs uppercase tracking-wide text-muted-foreground/80 sm:min-w-[140px]">
                      <span className="block text-[11px] text-muted-foreground">
                        Created by
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {todo.owner.email}
                      </span>
                    </div>
                  ) : null}
                  <div>
                    <span
                      className={`text-sm font-medium ${
                        todo.isComplete
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {todo.task}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={checkOrUncheckTodoFormAction}>
                    <input
                      name="isComplete"
                      type="hidden"
                      value={String(todo.isComplete)}
                    />
                    <input name="id" type="hidden" value={String(todo.id)} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-xl text-muted-foreground hover:text-foreground"
                      aria-label={
                        todo.isComplete
                          ? "Mark as incomplete"
                          : "Mark as complete"
                      }
                    >
                      {todo.isComplete ? (
                        <RotateCcw className="size-4" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                    </Button>
                  </form>
                  <form action={deleteTodoFormAction}>
                    <input name="id" type="hidden" value={String(todo.id)} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-xl text-muted-foreground hover:text-destructive"
                      aria-label="Delete todo"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 px-6 py-12 text-center text-sm text-muted-foreground">
            You don't have any todos!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
