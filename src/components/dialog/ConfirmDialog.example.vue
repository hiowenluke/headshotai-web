<!-- Usage example: In any Vue component -->
<template>
  <div>
    <!-- Trigger buttons -->
    <button @click="showDeleteConfirm = true">Delete Project</button>
    <button @click="showInfoDialog = true">Show Info</button>
    <button @click="showCustomDialog = true">Custom Content</button>
    
    <!-- Delete confirmation dialog -->
    <ConfirmDialog 
      :open="showDeleteConfirm"
      title="Confirm Delete"
      message="This action cannot be undone. Are you sure you want to delete this project?"
      cancel-text="Cancel"
      confirm-text="Delete"
      :show-backdrop="true"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
    
    <!-- Info dialog (single button) -->
    <ConfirmDialog 
      :open="showInfoDialog"
      title="Success"
      message="Project has been saved successfully!"
      :show-cancel="false"
      confirm-text="Got it"
      @confirm="showInfoDialog = false"
    />
    
    <!-- Custom content dialog -->
    <ConfirmDialog 
      :open="showCustomDialog"
      title="User Details"
      @confirm="handleSave"
      @cancel="showCustomDialog = false"
    >
      <div class="user-form">
        <input v-model="userName" placeholder="Username" />
        <input v-model="userEmail" placeholder="Email" />
        <textarea v-model="userBio" placeholder="Bio"></textarea>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ConfirmDialog from '@/components/dialog/ConfirmDialog.vue';

// Dialog states
const showDeleteConfirm = ref(false);
const showInfoDialog = ref(false);
const showCustomDialog = ref(false);

// Form data
const userName = ref('');
const userEmail = ref('');
const userBio = ref('');

// Event handlers
function handleDelete() {
  console.log('Execute delete operation');
  showDeleteConfirm.value = false;
  // Call delete API here
}

function handleSave() {
  console.log('Save user info:', {
    name: userName.value,
    email: userEmail.value,
    bio: userBio.value
  });
  showCustomDialog.value = false;
  // Call save API here
}
</script>

<style scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-form input,
.user-form textarea {
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 14px;
}

.user-form input::placeholder,
.user-form textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.user-form textarea {
  resize: vertical;
  min-height: 80px;
}
</style>
