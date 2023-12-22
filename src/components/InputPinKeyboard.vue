<template>
  <div class="row q-mt-lg q-mx-xl">
    <div v-for="item in indicators" :key="item" class="col-2 column items-center">
      <q-icon v-if="item" name="fa fa-circle" color="primary" />
      <q-icon v-else class="far fa-circle"  color="primary" />
    </div>
  </div>
  <div class="row q-mt-lg">
    <div v-for="cell in pinItems" :key="cell.id" class="col-4 column items-center">
      <q-btn v-if="cell.value!=undefined" 
        class="text-white" 
        :ripple="{ early:true, color:'grey-9' }"
        flat
        rounded
        size="1.4rem"
        @click="onDigit(cell.value)"
      >
        <span class="keypad-digit">{{ cell.value }}</span>
      </q-btn>
      <q-btn v-if="cell.back"
        :ripple="{ early:true, color:'grey-9' }" 
        flat
        rounded
        size="1.4rem"
        @click="onDelete"
      >
        <img height="20" src="~assets/backspace.svg" />
      </q-btn>
      <div v-if="cell.letters" class="keypad-letters text-primary">{{ cell.letters }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const pinItems = [
  { id: 1, value: '1' },
  { id: 2, value: '2', letters: 'A B C' },
  { id: 3, value: '3', letters: 'D E F' },
  { id: 4, value: '4', letters: 'G H I' },
  { id: 5, value: '5', letters: 'J K L' },
  { id: 6, value: '6', letters: 'M N O' },
  { id: 7, value: '7', letters: 'P Q R S' },
  { id: 8, value: '8', letters: 'T U V' },
  { id: 9, value: '9', letters: 'W X Y Z' },
  { id: 10 },
  { id: 11, value: '0' },
  { id: 12, back: true },
];

const PIN_SIZE = 6

// props
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

// data
const indicators = ref(Array(PIN_SIZE).fill(false))
const pin = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

// watchers
watch(pin, (value) => { 
  indicators.value = Array(value.length).fill(true).concat(Array(PIN_SIZE - value.length).fill(false))
})

// methods
function onDigit(value: string) {
  if(pin.value.length < PIN_SIZE) {
    pin.value = pin.value + value
  }
}

function onDelete() {
  if(pin.value.length > 0) {
    pin.value = pin.value.substring(0, pin.value.length-1)
  }
}

</script>

<style scoped>
.keypad-digit {
  font-size: 1.7rem;
}
.keypad-letters {
  font-size: 0.7rem;
}
</style>