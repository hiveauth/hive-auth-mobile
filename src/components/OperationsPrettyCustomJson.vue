<template>
  <div v-if="id=='follow' && followData.type=='follow' && followData.params?.what?.at(0)=='blog'">
    <div><span class="text-bold">Follow:</span> {{ followData.params?.following }}</div>
  </div>
  <div v-else-if="id=='follow' && followData.type=='follow' && followData.params?.what?.at(0)=='ignore'">
    <div><span class="text-bold">Mute:</span> {{ followData.params?.following }}</div>
  </div>
  <div v-else-if="id=='follow' && followData.type=='follow' && followData.params?.what?.length==0">
    <div><span class="text-bold">Unfollow or Unmute:</span> {{ followData.params?.following }}</div>
  </div>

  <div v-else-if="id=='reblog' && reblogData.type=='reblog' && !reblogData.params?.delete">
    <div class="text-bold">Reblog</div>
    <div><span class="text-bold">Author:</span> {{ reblogData.params?.author }}</div>
    <div><span class="text-bold">Permlink:</span> {{ reblogData.params?.permlink }}</div>
  </div>
  <div v-else-if="id=='reblog' && reblogData.type=='reblog' && reblogData.params?.delete">
    <div class="text-bold">Remove reblog</div>
    <div><span class="text-bold">Author:</span> {{ reblogData.params?.author }}</div>
    <div><span class="text-bold">Permlink:</span> {{ reblogData.params?.permlink }}</div>
  </div>
  <!-- Unmanaged custom json -->
  <div v-else>
    <div><span class="text-bold">id:</span> {{ data.id }}</div>
    <div><span class="text-bold">json:</span> {{ data.json }}</div>
    <div><span class="text-bold">required_auths:</span> {{ JSON.stringify(data.required_auths) }}</div>
    <div><span class="text-bold">required_posting_auths:</span> {{ JSON.stringify(data.required_posting_auths) }}</div>
  </div>
</template>

<script setup lang="ts">

import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  }
});

// Data
const id = ref('')
const json = ref(undefined)

// computed
const followData = computed(() => { 
  return { type: json.value[0], params: json.value[1] } 
})
const reblogData = computed(() => { 
  return { type: json.value[0], params: json.value[1] } 
})

// hooks
onMounted(() => {
  try {
    // try parsing data BEFORE assigning them
    const parsed = JSON.parse(props.data.json)
    // If any parsy error occurs, local data will be left unchanged
    id.value = props.data.id
    json.value = parsed
  } catch(e) {
    // Invalid JSON - It will be displayed as raw value
  }
});

</script>