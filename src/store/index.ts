import { createStore } from 'vuex'
import { auth } from './auth.module'
import { user } from './user.module'
import { pokemonCards } from './pokemonCards.module'

const store = createStore({
  modules: {
    auth,
    user,
    pokemonCards,
  },
})

export default store
