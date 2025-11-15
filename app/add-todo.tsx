"use client";

import { insertTodo } from "app/actions";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AddTodoForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (formData: FormData) => {
    const newTodo = formData.get("newTodo");

    if (!newTodo) {
      throw new Error("No newTodo");
    }

    if (typeof newTodo !== "string") {
      throw new Error("The newTodo must be a string");
    }

    await insertTodo({ newTodo: newTodo.toString() });
    formRef.current?.reset();
  };

  return (
    <Card className="shadow-lg shadow-primary/5">
      <CardHeader>
        <CardTitle>Add a todo</CardTitle>
        <CardDescription>
          Capture the next task your team needs to tackle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={onSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Input
            required
            name="newTodo"
            placeholder="Write a clear, actionable task..."
            aria-label="New todo"
            className="flex-1"
          />
          <Button
            type="submit"
            className="rounded-2xl shadow-sm sm:min-w-[140px]"
          >
            Add Todo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
