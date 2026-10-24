<template>
  <v-container class="todo-container">
    
    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-card color="primary" variant="tonal" class="pa-2 stat-card">
          <v-card-item title="Total Tasks">
            <template #append>
              <v-icon icon="mdi-format-list-bulleted" size="large"></v-icon>
            </template>
            <div class="stat-number primary-text">{{ tasks.length }}</div>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card color="success" variant="tonal" class="pa-2 stat-card">
          <v-card-item title="Completed Tasks">
            <template #append>
              <v-icon icon="mdi-checkbox-marked-circle-outline" size="large"></v-icon>
            </template>
            <div class="stat-number success-text">{{ completedTasksCount }}</div>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card color="warning" variant="tonal" class="pa-2 stat-card">
          <v-card-item title="Pending Tasks">
            <template #append>
              <v-icon icon="mdi-clock-outline" size="large"></v-icon>
            </template>
            <div class="stat-number warning-text">{{ pendingTasksCount }}</div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    
    <v-alert v-if="taskError" type="error" density="compact" class="mb-3">
      {{ taskError }}
    </v-alert>

    <v-card class="elevation-2 task-card">
      <v-card-title class="task-card-title">
        <span class="text-h6">My Tasks</span>
       
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          Add Task
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="8">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search tasks..."
              hide-details
              density="compact"
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filterStatus"
              :items="['All', 'Pending', 'Completed']"
              label="Filter Status"
              hide-details
              density="compact"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>

      
      <v-list class="px-2 task-list">
        <template v-if="loadingTasks">
          <v-list-item class="empty-state">Loading tasks...</v-list-item>
        </template>
        <template v-else-if="filteredTasks.length === 0">
          <v-list-item class="empty-state">
            No tasks available. Click "Add Task" to create one.
          </v-list-item>
        </template>

        <v-list-item
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-item"
          :class="{ 'completed-item': task.completed }"
        >
          <template #prepend>
            
            <v-checkbox-btn
              :model-value="task.completed"
              color="success"
              @update:model-value="updateTaskStatus(task, $event)"
            ></v-checkbox-btn>
          </template>

          <v-list-item-title
            class="task-title"
            :class="{ 'completed-text': task.completed }"
          >
            {{ task.title }}
          </v-list-item-title>

          <v-list-item-subtitle v-if="task.description" class="task-subtitle">
            {{ task.description }}
          </v-list-item-subtitle>

          <template #append>
            <div class="task-actions">
              <v-chip
                size="x-small"
                :color="task.completed ? 'success' : 'warning'"
                class="status-chip"
              >
                {{ task.completed ? 'Completed' : 'Pending' }}
              </v-chip>

            
              <v-btn
                variant="text"
                density="comfortable"
                color="info"
                @click="openEditDialog(task)"
              >
                Edit
              </v-btn>

              
              <v-btn
                variant="text"
                density="comfortable"
                color="error"
                @click="deleteTask(task.id)"
              >
                Delete
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h6">{{ isEditing ? 'Edit Task' : 'Add Task' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid" @submit.prevent="saveTask">
            <v-text-field
              v-model="editedTask.title"
              label="Task Title"
              :rules="[(v) => !!v || 'Title is required']"
              required
              class="mb-2"
            ></v-text-field>

            <v-textarea
              v-model="editedTask.description"
              label="Description (Optional)"
              rows="3"
            ></v-textarea>

            <v-select
              v-model="editedTask.completed"
              :items="[
                { title: 'Pending', value: false },
                { title: 'Completed', value: true },
              ]"
              label="Status"
            ></v-select>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :disabled="!valid" @click="saveTask">
            {{ isEditing ? 'Update' : 'Add' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Delete task?</v-card-title>
        <v-card-text>This task will be permanently removed.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cancelDelete">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { createData, deleteData, getData, updateData } from '../firebase/firebase-helper.js'

export default {
  name: 'TodoApp',
  data() {
    return {
      search: '',
      filterStatus: 'All',
      dialog: false,
      deleteDialog: false,
      taskToDeleteId: null,
      loadingTasks: true,
      taskError: '',
      isEditing: false,
      valid: false,
      editedIndex: -1,
      editedTask: {
        id: null,
        title: '',
        description: '',
        completed: false,
      },
      defaultTask: {
        id: null,
        title: '',
        description: '',
        completed: false,
      },
      tasks: [],
    }
  },
  created() {
    this.loadTasks()
  },
  computed: {
    completedTasksCount() {
      return this.tasks.filter((t) => t.completed).length
    },
    pendingTasksCount() {
      return this.tasks.filter((t) => !t.completed).length
    },
    filteredTasks() {
      return this.tasks.filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(this.search.toLowerCase()) ||
          task.description.toLowerCase().includes(this.search.toLowerCase())

        if (this.filterStatus === 'Completed') return matchesSearch && task.completed
        if (this.filterStatus === 'Pending') return matchesSearch && !task.completed
        return matchesSearch
      })
    },
  },
  methods: {
    async loadTasks() {
      this.loadingTasks = true
      this.taskError = ''
      try {
        this.tasks = await getData('tasks')
      } catch (error) {
        this.taskError = `Failed to load tasks: ${error.message}`
      } finally {
        this.loadingTasks = false
      }
    },
    openCreateDialog() {
      this.isEditing = false
      this.editedIndex = -1
      this.editedTask = { ...this.defaultTask }
      this.dialog = true
    },
    openEditDialog(task) {
      this.isEditing = true
      this.editedIndex = this.tasks.findIndex((t) => t.id === task.id)
      this.editedTask = JSON.parse(JSON.stringify(task))
      this.dialog = true
    },
    closeDialog() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedTask = { ...this.defaultTask }
        this.editedIndex = -1
      })
    },
    async saveTask() {
      if (!this.editedTask.title.trim()) return

      const taskData = {
        title: this.editedTask.title.trim(),
        description: this.editedTask.description.trim(),
        completed: this.editedTask.completed,
      }
      this.taskError = ''

      try {
        if (this.isEditing && this.editedIndex > -1) {
          const task = this.tasks[this.editedIndex]
          await updateData('tasks', task.id, taskData)
          Object.assign(task, taskData)
        } else {
          const id = await createData('tasks', taskData)
          this.tasks.push({ ...taskData, id })
        }
        this.closeDialog()
      } catch (error) {
        this.taskError = `Failed to save task: ${error.message}`
      }
    },
    async updateTaskStatus(task, completed) {
      this.taskError = ''
      try {
        await updateData('tasks', task.id, { completed })
        task.completed = completed
      } catch (error) {
        this.taskError = `Failed to update task status: ${error.message}`
      }
    },
    deleteTask(id) {
      this.taskToDeleteId = id
      this.deleteDialog = true
    },
    cancelDelete() {
      this.deleteDialog = false
      this.taskToDeleteId = null
    },
    async confirmDelete() {
      this.taskError = ''
      try {
        await deleteData('tasks', this.taskToDeleteId)
        this.tasks = this.tasks.filter((task) => task.id !== this.taskToDeleteId)
        this.cancelDelete()
      } catch (error) {
        this.taskError = `Failed to delete task: ${error.message}`
      }
    },
  },
}
</script>

<style scoped>

.todo-container {
  max-width: 1000px;
  margin: 0 auto;
}


.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 8px;
}


.task-card {
  border-radius: 8px;
}

.task-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}


.task-list {
  background-color: transparent;
}

.task-item {
  margin-bottom: 8px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.task-item:hover :deep(.v-list-item__overlay) {
  opacity: 0 !important;
}

.task-title {
  font-weight: 500;
}

.completed-text {
  text-decoration: line-through;
  color: #9e9e9e !important;
}

.task-subtitle {
  color: #616161;
}

.empty-state {
  text-align: center;
  padding: 24px 0;
  color: #9e9e9e;
}


.task-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-chip {
  margin-right: 8px;
}
</style>