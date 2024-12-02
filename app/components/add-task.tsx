"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveTasks } from "@/utils/localstorage";

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

export const AddTask = () => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<{
    text: string;
  }>({
    defaultValues: {
      text: "",
    },
  });

  
  const addTaskMutation = useMutation({
    mutationFn: (newTask: Task) => {
      const tasks = queryClient.getQueryData<Task[]>(["tasks"]) || [];
      const updatedTasks = [...tasks, newTask];

      return saveTasks(updatedTasks);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleAdd = (data: { text: string }) => {
    if (data.text.trim() !== "") {
      const newTask = {
        id: Math.random().toString(36).slice(2, 9),
        text: data.text,
        completed: false,
      };
      addTaskMutation.mutate(newTask);
      setValue("text", "");
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(handleAdd)}
        className="flex flex-col items-center gap-4 justify-center"
      >
        <Input
          type="text"
          placeholder="New Todo"
          {...register("text", { required: "Task text is required" })}
          className="w-full max-w-md  border border-stone-600 p-6 rounded-lg shadow-md shadow-emerald-400"
        />
        {errors.text && <p className="text-red-500">{errors.text.message}</p>}
        <Button type="submit" className="bg-teal-500 text-white hover:text-red-700">
          Add new task
        </Button>
      </form>
    </div>
  );
};
