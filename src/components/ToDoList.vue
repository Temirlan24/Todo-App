<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ToDoListItem from './ToDoListItem.vue';
import { useTodoStore, TodoItem } from '../store/todoStore';
import { storeToRefs } from 'pinia';
import draggable from 'vuedraggable';
import { db } from '../firebase/index.ts';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';

const { allTodoList, allCompleted, activetasks, completedTasks } = storeToRefs(useTodoStore());
const { addToDo, updateTodo, checkAllTodos, clearAll, reorderTodos } = useTodoStore();

const todoInput = ref('');
const filter = ref('all');
const isEditing = ref(false);
const isEditingTodo = ref<TodoItem>();
const isDarkTheme = ref(false);

onMounted(async () => {
  const savedTheme = localStorage.getItem('theme');
  isDarkTheme.value = savedTheme === 'dark';
  let fbTodos: TodoItem[] = [];
  const querySnapshot = await getDocs(collection(db, 'todos'));
  querySnapshot.forEach((doc) => {
    console.log(doc.id, ' => ', doc.data());
    const todo = {
      id: doc.id,
      name: doc.data().name,
      completed: doc.data().completed,
    };
    fbTodos.push(todo);
  });
  reorderTodos(fbTodos);
});

const getFilteredTodoList = computed<TodoItem[]>({
  get() {
    if (filter.value === 'active') {
      return allTodoList.value.filter((item) => !item.completed);
    } else if (filter.value === 'completed') {
      return allTodoList.value.filter((item) => item.completed);
    }
    return allTodoList.value;
  },
  set(updatedList) {
    if (filter.value === 'all') {
      console.log('1');
      allTodoList.value = updatedList;
    }
  },
});

function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value;
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light');
}

function handleSubmit() {
  if (!todoInput.value) return;
  if (isEditing.value && isEditingTodo.value) {
    const updatedTodo: TodoItem = {
      id: isEditingTodo.value?.id,
      name: todoInput.value,
      completed: isEditingTodo.value?.completed,
    };
    updateTodo(updatedTodo);
    isEditing.value = false;
  } else {
    addToDo(todoInput.value);
  }
  todoInput.value = '';
}

function handleEdit(id: string) {
  const item = allTodoList.value.find((todo: TodoItem) => todo.id === id);
  isEditing.value = true;
  if (item) {
    isEditingTodo.value = item;
    todoInput.value = item.name;
  }
}

function onDragEnd() {
  reorderTodos([...allTodoList.value]);
}

async function saveToServer() {
  const todosCollection = collection(db, 'todos');
  const existingTodosSnapshot = await getDocs(todosCollection);

  const existingTodos: Record<string, TodoItem> = {};
  existingTodosSnapshot.forEach((doc: any) => {
    existingTodos[doc.id] = doc.data();
  });

  const localTodos: Record<string, { name: string; completed: boolean }> = {};
  allTodoList.value.forEach((todo: TodoItem) => {
    localTodos[todo.id] = { name: todo.name, completed: todo.completed };
  });

  for (const id in localTodos) {
    if (!existingTodos[id]) {
      await setDoc(doc(todosCollection, id), localTodos[id]);
    } else if (
      existingTodos[id].name !== localTodos[id].name ||
      existingTodos[id].completed !== localTodos[id].completed
    ) {
      await setDoc(doc(todosCollection, id), localTodos[id]);
    }
  }

  for (const id in existingTodos) {
    if (!localTodos[id]) {
      await deleteDoc(doc(todosCollection, id));
    }
  }
}
</script>

<template>
  <div class="container" :class="{ 'dark-theme': isDarkTheme }">
    <header>
      <img src="../assets/rb_20395.png" alt="" height="150" />
      <div class="header-content">
        <h1>Today I need to</h1>
        <button @click="toggleTheme" class="dark-mode-button">
          {{ isDarkTheme ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <main>
      <div class="input-form">
        <input
          class="todo-input"
          type="text"
          placeholder="Add new todo..."
          v-model="todoInput"
          @keyup.enter="handleSubmit"
        />
        <button v-show="todoInput.length" @click="handleSubmit" class="submit-btn">Submit</button>
      </div>

      <div class="list-container">
        <draggable
          v-model="getFilteredTodoList"
          group="todos"
          class="drag-container"
          @end="onDragEnd"
          itemKey="id"
        >
          <template #item="{ element }" class="todo-item">
            <li class="todo-item">
              <ToDoListItem :item="element" @edit="handleEdit" />
            </li>
          </template>
        </draggable>
      </div>

      <div class="card-container" v-if="allTodoList.length">
        <div class="card">
          <p>{{ completedTasks }} tasks.</p>
          <h4>Completed</h4>
          <progress class="progress completed" :max="allTodoList.length" :value="completedTasks" />
        </div>
        <div class="card">
          <p>{{ activetasks }} tasks.</p>
          <h4>To be finished</h4>
          <progress class="progress active" :max="allTodoList.length" :value="activetasks" />
        </div>
      </div>
    </main>

    <footer class="footer">
      <div v-if="!allTodoList.length" class="message">
        <i class="fas fa-check-circle completed-icon"></i>
        <p class="footer-text">Congrat, you have no more tasks to do</p>
      </div>
      <div v-else class="actions">
        <button @click="checkAllTodos" v-if="!allCompleted">Check All</button>
        <button :class="{ active: filter === 'all' }" @click="filter = 'all'">All</button>
        <button :class="{ active: filter === 'active' }" @click="filter = 'active'">Active</button>
        <button :class="{ active: filter === 'completed' }" @click="filter = 'completed'">
          Completed
        </button>
        <button @click="clearAll" v-if="allCompleted">Clear completed</button>
        <button @click="saveToServer">Save to server</button>
      </div>
    </footer>
  </div>
</template>

<style scoped></style>
