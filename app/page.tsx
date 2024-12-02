"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AddTask } from "./components/add-task"
import {TodoList} from "./components/todo-list"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

const queryClient = new QueryClient()
export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col items-center gap-8 p-8">
        <h1 className="text-stone-300 text-3xl font-bold">TodoInput</h1>
        <AddTask/>
        <h2 className="text-stone-400 text-2xl font-bold">TodoList</h2>
        <TodoList/>
      </div>
      <ReactQueryDevtools/>
    </QueryClientProvider>
  )
}
