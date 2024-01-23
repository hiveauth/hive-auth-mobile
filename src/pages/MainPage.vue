<template>
  <q-page class="background">
    <div v-if="$q.platform.is.ios" class="q-mt-lg"></div>
    <q-btn v-if="storeApp.isUnlocked" style="color: #e21438"
        flat
        rounded
        size="lg"
        icon="menu"
        aria-label="Menu"
        @click="toggleMenu"
      />
    <div class="flex flex-center column">
        <img
          src="~assets/logo-vert-negative.svg"
          style="width: 20rem; height: 20rem"
        >
        <InputPin v-if="!storeApp.isUnlocked" />
        <div v-if="storeApp.isUnlocked" class="q-my-md text-white">{{$t('main_page.no_pending_request')}}</div>
        <div v-if="storeApp.isUnlocked" row>
          <q-btn push round class="q-mx-lg" @click="$router.push({ name: 'scan' });">
              <img src="~assets/btn-qr-red-shadow.png" style="width: 7rem;" >
          </q-btn>
        </div>
    </div>
  </q-page>
</template>

<script setup>
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from 'src/stores/storeApp';
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

import InputPin from 'components/InputPin.vue';

const router = useRouter();
const storeApp = useAppStore();
const { t } = useI18n(), $t = t

// functions
function toggleMenu () {
  storeApp.menuOpen = !storeApp.menuOpen
}

</script>

<script>
export default defineComponent({
  name: 'MainPage',
  components: { InputPin }
})
</script>
  
<style lang="scss" scoped>
.background {
  background-image: linear-gradient(to bottom , #3c4956, #091115);
}
</style>