<template>
    <q-page class="flex flex-center background">
      <img
        src="~assets/logo-vert-negative.svg"
        style="width: 350px; height: 350px"
      >
      <!-- <div center>No pending request</div> -->
      <div>
        <q-btn flat round class="q-mx-lg">
            <img 
                src="~assets/btn-help-red.png"
                style="width: 75px; height: px"
            >
        </q-btn>
        <q-btn flat round class="q-mx-lg">
            <img 
                src="~assets/btn-qr-red.png"
                style="width: 75px; height: px"
            >
        </q-btn>
      </div>
    </q-page>
  </template>
  
  <script>
  import { defineComponent } from 'vue'
  
  export default defineComponent({
    name: 'MainPage'
  })
  </script>
  
<style lang="scss" scoped>
.background {
  background-image: linear-gradient(to bottom , #3c4956, #091115);
}
</style>