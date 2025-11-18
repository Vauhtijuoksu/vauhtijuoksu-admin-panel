import { createRouter, createWebHistory } from 'vue-router'
import MainView from './components/MainView.vue'
import EditMain from './components/EditMain.vue'
import EditGameData from './components/EditGameData.vue'
import EditIncentives from './components/EditIncentives.vue'
import EditParticipants from './components/EditParticipants.vue'
import EditDonation from './components/EditDonation.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainView,
    },
    {
      path: '/edit',
      component: EditMain,
    },
    {
      path: '/edit/gamedata',
      component: EditGameData,
    },
    {
      path: '/edit/incentives',
      component: EditIncentives,
    },
    {
      path: '/edit/participants',
      component: EditParticipants,
    },
    {
      path: '/edit/donation/:id',
      component: EditDonation,
    },
  ]
})