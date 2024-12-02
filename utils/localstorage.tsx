export const STORAGE_KEY = "todo-list-tasks";
type Task = {
  id: string;
  text: string;
  completed: boolean;
};
export const getTasks = (): Promise<Task[]> => {
  return new Promise((resolve) => {
    const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setTimeout(() => resolve(tasks), 100);
  });
};

export const saveTasks = (tasks: Task[]): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      setTimeout(resolve, 100);
    } catch {
      setTimeout(reject, 100);
    }
  });
};
