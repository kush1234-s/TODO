"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import { Edit, Trash } from "lucide-react";
import { getTasks, saveTasks } from "@/utils/localstorage";
import { useSearchParams } from "next/navigation";
import useParamsStore from "@/helper/usePramsStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { ChangeEvent } from "react";
export const TodoList = () => {
  const addQueryParams = useParamsStore();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });
  type Task = {
    id: string;
    text: string;
    completed: boolean;
  };
  const params = new URLSearchParams(searchParams.toString());
  const updateTaskMutation = useMutation({
    mutationFn: (updatedTasks: Task[]) => saveTasks(updatedTasks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const toggleTaskCompletion = (id: string) => {
    const updatedTasks = tasks.map((task: Task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    updateTaskMutation.mutate(updatedTasks);
  };
  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task: Task) => task.id !== id);
    updateTaskMutation.mutate(updatedTasks);
  };
  const filteredTasks = tasks.filter((task: Task) => {
    const filter = params.get("filter");
    if (filter === "done") return task.completed;
    if (filter === "todo") return !task.completed;
    return true;
  });

  const deleteDoneTasks = () => {
    const updatedTasks = tasks.filter((task: Task) => !task.completed);
    updateTaskMutation.mutate(updatedTasks);
  };

  const deleteAllTasks = () => {
    updateTaskMutation.mutate([]);
  };
  const handleChange = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const updatedTasks = tasks.map((task: Task) =>
      task.id === id ? { ...task, text: e.target.value } : task
    );
    updateTaskMutation.mutate(updatedTasks);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <Button
          onClick={() => {
            addQueryParams("filter", "all");
          }}
          className="bg-teal-500 text-white"
        >
          All
        </Button>
        <Button
          onClick={() => {
            addQueryParams("filter", "done");
          }}
          className="bg-teal-500 text-white"
        >
          Done
        </Button>
        <Button
          onClick={() => {
            addQueryParams("filter", "todo");
          }}
          className="bg-teal-500 text-white"
        >
          Todo
        </Button>
      </div>
      <ul className="w-full max-w-md space-y-2">
        {filteredTasks.map((task: Task) => (
          <li
            key={task.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div className="flex items-center space-x-2 relative">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTaskCompletion(task.id)}
              />
              <label
                htmlFor={`task-${task.id}`}
                className={`${
                  task.completed ? "line-through text-red-500" : ""
                } `}
              >
                {task.text}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Popover>
                  <PopoverTrigger>
                    {" "}
                    <Edit className="w-4 h-4" />
                  </PopoverTrigger>
                  <PopoverContent className="p-1 absolute top-1 left-[-300px]">
                    <Input
                      type="text"
                      placeholder={task.text}
                      // value={task.text}
                      onChange={(e) => handleChange(task.id, e)}
                      className="border border-pink-800 rounded-lg placeholder:p-1 pl-2"
                    />
                  </PopoverContent>
                </Popover>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTask(task.id)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button onClick={deleteDoneTasks} className="bg-red-500 text-white">
          Delete done tasks
        </Button>
        <Button onClick={deleteAllTasks} className="bg-red-500 text-white">
          Delete all tasks
        </Button>
      </div>
    </div>
  );
};
