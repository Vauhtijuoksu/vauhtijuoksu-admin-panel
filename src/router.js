import { createRouter, createWebHistory } from 'vue-router'
import MainView from './components/MainView.vue'
import EditData from './components/EditData.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainView,
    },
    {
      path: '/edit',
      component: EditData,
    }
  ]
})