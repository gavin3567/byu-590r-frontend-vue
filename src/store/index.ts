import { createStore } from 'vuex'
import { auth } from './auth.module'
import { user } from './user.module' // Add this import

const store = createStore({
  modules: {
    auth,
    user, // Add user module here
  },
})

export default store
