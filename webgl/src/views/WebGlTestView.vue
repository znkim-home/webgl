<template>
  <div>
    <app-main></app-main>
  </div>
</template>
import AppMain from '@/components/AppMain.vue';

export default {
  name: 'WebGlTestView',
  components: {
    AppMain
  },
  created () {
    console.log("test");
  }
}

<style>

</style>
