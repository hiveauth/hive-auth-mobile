<template>
  <div>
    <q-item clickable>
      <q-item-section avatar>
        <q-avatar>
          <q-icon name="key" color="primary" size="1.75rem" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label>Posting Key</q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <div class="row">
          <div class="col">
            <q-icon color="primary" name="fa-solid fa-copy" size="1.75rem" />
          </div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <div class="col">
            <q-icon color="red" name="fa-solid fa-trash" size="1.75rem" />
          </div>
        </div>
      </q-item-section>
    </q-item>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
