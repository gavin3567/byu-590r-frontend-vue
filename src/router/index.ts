import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/home/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/about/AboutView.vue'),
    },
    // Add this to your routes array
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/login/ResetPasswordView.vue'),
    },
    // Add the new Pokemon Cards route
    {
      path: '/pokemon-cards',
      name: 'pokemon-cards',
      component: () => import('../views/pokemon-cards/PokemonCardsView.vue'),
    },
  ],
})

export default router
