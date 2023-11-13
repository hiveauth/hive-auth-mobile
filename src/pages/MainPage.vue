<template>
  <q-page class="background">
    <q-btn  v-if="storeApp.isUnlocked" style="color: #e21438"
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
          style="width: 350px; height: 350px"
        >
        <InputPin v-if="!storeApp.isUnlocked" />
        <div v-if="storeApp.isUnlocked" class="q-my-md text-white">{{$t('main_page.no_pending_request')}}</div>
        <div v-if="storeApp.isUnlocked" row>
          <!-- <q-btn flat round class="q-mx-lg" >
              <img src="~assets/btn-help-red.png" style="width: 60px; height: px" >
          </q-btn> -->
          <q-btn push round class="q-mx-lg" @click="$router.push({ name: 'scan' });">
              <img src="~assets/btn-qr-red-shadow.png" style="width: 7rem; height: px" >
          </q-btn>
        </div>
    </div>
  </q-page>
</template>

<script setup>
import { defineComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from 'src/stores/storeApp';
import { useAccountsStore } from 'src/stores/storeAccounts';
import { useI18n } from 'vue-i18n'

import InputPin from 'components/InputPin.vue';

const router = useRouter();
const storeApp = useAppStore();
const storeAccounts = useAccountsStore();
const { t } = useI18n(), $t = t

// functions
function toggleMenu () {
  storeApp.menuOpen = !storeApp.menuOpen
}

// hooks
onMounted(() => {
  if (storeApp.isUnlocked && storeAccounts.accounts.length == 0) {
    // router.push('accounts')
  }
});

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