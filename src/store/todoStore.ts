import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface TodoItem {
  id: string;
  name: string;
  completed: boolean;
}

export const useTodoStore = defineStore('todo', () => {
  const allTodoList = ref<TodoItem[]>([]);

  const allCompleted = computed(() => {
    return allTodoList.value.length > 0 && allTodoList.value.every((todo) => todo.completed);
  });
  const completedTasks = computed(() => {
    return allTodoList.value.filter((item) => item.completed === true).length;
  });
  const activetasks = computed(() => {
    return allTodoList.value.filter((item) => item.completed === false).length;
  });

  function addToDo(name: string) {
    const todo: TodoItem = {
      id: Date.now().toString(),
      name,
      completed: false,
    };
    allTodoList.value.push(todo);
  }

  function updateTodo(updatedTodo: TodoItem) {
    const index = allTodoList.value.findIndex((todo) => todo.id === updatedTodo.id);
    if (index !== -1) {
      allTodoList.value[index] = updatedTodo;
    }
  }

  function deleteTodo(id: string) {
    const index = allTodoList.value.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      allTodoList.value.splice(index, 1);
    }
  }

  function checkAllTodos() {
    allTodoList.value.forEach((todo) => {
      todo.completed = true;
    });
  }

  function clearAll() {
    allTodoList.value.length = 0;
  }

  function reorderTodos(newOrder: TodoItem[]) {
    allTodoList.value = newOrder;
  }

  return {
    allTodoList,
    completedTasks,
    activetasks,
    allCompleted,
    addToDo,
    updateTodo,
    deleteTodo,
    checkAllTodos,
    clearAll,
    reorderTodos,
  };
});
