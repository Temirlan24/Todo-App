<script setup lang="ts">
import { TodoItem, useTodoStore } from '../store/todoStore';

const props = defineProps<{
  item: TodoItem;
}>();
const todoStore = useTodoStore();

const emit = defineEmits<{
  (e: 'edit', id: string): void;
}>();
function handleCheck(event: Event) {
  const checkbox = event.target as HTMLInputElement;
  const updatedTodo = { ...props.item, completed: checkbox.checked };
  todoStore.updateTodo(updatedTodo);
}
function toggleEdit() {
  emit('edit', props.item.id);
}

function handleDelete() {
  todoStore.deleteTodo(props.item.id);
}
</script>

<template>
  <div class="todo-item-form">
    <div class="todo-left">
      <i class="fas fa-grip-vertical drag-icon"></i>
      <input class="checkbox" type="checkbox" :checked="item.completed" @change="handleCheck" />
      <span class="todo-text">{{ item.name }}</span>
    </div>
    <div class="todo-actions">
      <i class="fas fa-edit edit-icon" @click="toggleEdit"></i>
      <i class="fas fa-trash delete-icon" @click="handleDelete"></i>
    </div>
  </div>
</template>

<style scoped></style>
