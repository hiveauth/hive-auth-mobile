import { defineStore } from 'pinia';

export const useHasPathStore = defineStore('has-path', {
  state: () => ({
    has_path: '',
    has_path_name: 'Home',
  }),
  getters: {
    pathName: (state) => state.has_path_name,
  },
  actions: {
    updateTo(path: string, pathName: string) {
      this.has_path = path;
      this.has_path_name = pathName;
    },
  },
});
