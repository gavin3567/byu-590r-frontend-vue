// src/store/pokemonCards.module.ts
import pokemonCardService from '../services/pokemonCardService'

export const pokemonCards = {
  namespaced: true,

  state: {
    pokemonCards: [],
    currentPokemonCard: {
      name: '',
      pokemon_name: '',
      energy_type: '',
      length: '',
      weight: '',
      card_number: '',
      card_rarity: '',
      description: '',
      card_image: '',
    },
    loading: false,
    error: null,
  },

  mutations: {
    SET_POKEMON_CARDS(state, pokemonCards) {
      state.pokemonCards = pokemonCards
    },

    SET_CURRENT_POKEMON_CARD(state, pokemonCard) {
      state.currentPokemonCard = pokemonCard
    },

    SET_LOADING(state, loading) {
      state.loading = loading
    },

    SET_ERROR(state, error) {
      state.error = error
    },
  },

  actions: {
    getPokemonCards({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      return pokemonCardService
        .getPokemonCards()
        .then((response) => {
          commit('SET_POKEMON_CARDS', response.data)
          return response
        })
        .catch((error) => {
          commit('SET_ERROR', error.message || 'Failed to fetch Pokemon cards')
          throw error
        })
        .finally(() => {
          commit('SET_LOADING', false)
        })
    },

    getPokemonCard({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      return pokemonCardService
        .getPokemonCard(id)
        .then((response) => {
          commit('SET_CURRENT_POKEMON_CARD', response.data)
          return response
        })
        .catch((error) => {
          commit('SET_ERROR', error.message || 'Failed to fetch Pokemon card')
          throw error
        })
        .finally(() => {
          commit('SET_LOADING', false)
        })
    },

    createPokemonCard({ commit }, pokemonCard) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      return pokemonCardService
        .createPokemonCard(pokemonCard)
        .then((response) => {
          commit('SET_CURRENT_POKEMON_CARD', response.data)
          return response
        })
        .catch((error) => {
          commit('SET_ERROR', error.message || 'Failed to create Pokemon card')
          throw error
        })
        .finally(() => {
          commit('SET_LOADING', false)
        })
    },
  },

  getters: {
    isPokemonCardsLoaded: (state) => state.pokemonCards.length > 0,
    getPokemonCardByName: (state) => (name) => {
      return state.pokemonCards.find((card) => card.name === name)
    },
  },
}
