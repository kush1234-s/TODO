"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Edit, Trash } from "lucide-react";
import { getTasks, saveTasks } from "@/utils/localstorage";
import { useSearchParams } from "next/navigation";
import useParamsStore from "@/helper/usePramsStore";
import { ChangeEvent } from "react";
import {
  DndContext,
  closestCorners,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

const DraggableItem = ({
  task,
  toggleTaskCompletion,
  handleChange,
  deleteTask,
}: {
  task: Task;
  toggleTaskCompletion: (id: string) => void;
  handleChange: (id: string, e: ChangeEvent<HTMLInputElement>) => void;
  deleteTask: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef } = useSortable({
    id: task.id,
  });

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between p-3 border rounded-xl"
    >
      <div className="flex items-center space-x-2 relative">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => toggleTaskCompletion(task.id)}
        />
        <label
          htmlFor={`task-${task.id}`}
          className={`${task.completed ? "line-through text-red-500" : ""}`}
        >
          {task.text}
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger>
              <Edit className="w-4 h-4 cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent className="p-1 absolute top-1 left-[-300px]">
            <Input
              type="text"
              placeholder={task.text}
              onChange={(e) => handleChange(task.id, e)}
              className="border border-pink-800 rounded-lg placeholder:p-1 pl-2 bg-orange-900"
            />
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
          <Trash className="w-4 h-4" />
        </Button>
      </div>
    </li>
  );
};

export const TodoList = () => {
  const addQueryParams = useParamsStore();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const activeIndex = filteredTasks.findIndex(
        (task) => task.id === active.id
      );
      const overIndex = filteredTasks.findIndex((task) => task.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        const updatedTasks = [...filteredTasks];
        const [removed] = updatedTasks.splice(activeIndex, 1);
        updatedTasks.splice(overIndex, 0, removed);

        updateTaskMutation.mutate(updatedTasks);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 border border-stone-600 p-8 rounded-lg shadow-xl shadow-orange-500">
      <div className="flex gap-2">
        <Button
          onClick={() => addQueryParams("filter", "all")}
          className="bg-teal-500 text-white hover:text-red-800"
        >
          All
        </Button>
        <Button
          onClick={() => addQueryParams("filter", "done")}
          className="bg-teal-500 text-white hover:text-red-800"
        >
          Done
        </Button>
        <Button
          onClick={() => addQueryParams("filter", "todo")}
          className="bg-teal-500 text-white hover:text-red-800"
        >
          Todo
        </Button>
      </div>
      <DndContext
        collisionDetection={closestCorners}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <ul className="w-full max-w-md space-y-2">
          <SortableContext
            items={filteredTasks}
            strategy={verticalListSortingStrategy}
          >
            {filteredTasks.map((task) => (
              <DraggableItem
                key={task.id}
                task={task}
                toggleTaskCompletion={toggleTaskCompletion}
                handleChange={handleChange}
                deleteTask={deleteTask}
              />
            ))}
          </SortableContext>
        </ul>
      </DndContext>
      <div className="flex gap-2">
        <Button
          onClick={deleteDoneTasks}
          className="hover:text-red-800 bg-red-500 text-white"
        >
          Delete done tasks
        </Button>
        <Button
          onClick={deleteAllTasks}
          className="hover:text-red-800 bg-red-500 text-white"
        >
          Delete all tasks
        </Button>
      </div>
    </div>
  );
};
