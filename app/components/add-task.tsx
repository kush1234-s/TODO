// "use client";

// import { useState } from "react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { saveTasks } from "@/utils/localstorage";

// type Task = {
//   id: string;
//   text: string;
//   completed: boolean;
// };
// export const AddTask = () => {
//   const [task, setTask] = useState("");
//   const queryClient = useQueryClient();

//   const addTaskMutation = useMutation({
//     mutationFn: (newTask: Task) => {
//       const tasks = queryClient.getQueryData<Task[]>(["tasks"]) || [];
//       const updatedTasks = [...tasks, newTask];

//       return saveTasks(updatedTasks);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["tasks"] });
//     },
//   });

//   const handleAdd = () => {
//     if (task.trim() !== "") {
//       const newTask = {
//         id: Math.random().toString(36).slice(2, 9),
//         text: task,
//         completed: false,
//       };
//       addTaskMutation.mutate(newTask);
//       setTask("");
//     }
//   };
//   return (
//     <div className="flex flex-col items-center gap-4">
//       <Input
//         type="text"
//         placeholder="New Todo"
//         value={task}
//         onChange={(e) => setTask(e.target.value)}
//         className="w-full max-w-md"
//       />
//       <Button onClick={handleAdd} className="bg-teal-500 text-white">
//         Add new task
//       </Button>
//     </div>
//   );
// };
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

  // Mutation to save tasks
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
          className="w-full max-w-md"
        />
        {errors.text && <p className="text-red-500">{errors.text.message}</p>}
        <Button type="submit" className="bg-teal-500 text-white">
          Add new task
        </Button>
      </form>
    </div>
  );
};
