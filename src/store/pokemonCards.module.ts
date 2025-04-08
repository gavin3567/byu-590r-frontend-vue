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
      inventory_total_qty: 1,
      checked_qty: 0,
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
    ADD_POKEMON_CARD(state, pokemonCard) {
      state.pokemonCards.push(pokemonCard)
    },
    UPDATE_POKEMON_CARD(state, updatedCard) {
      const index = state.pokemonCards.findIndex((card) => card.id === updatedCard.id)
      if (index !== -1) {
        state.pokemonCards.splice(index, 1, updatedCard)
      }
    },
    REMOVE_POKEMON_CARD(state, id) {
      state.pokemonCards = state.pokemonCards.filter((card) => card.id !== id)
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
          commit('ADD_POKEMON_CARD', response.data)
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
    updatePokemonCard({ commit }, { id, pokemonCard }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      return pokemonCardService
        .updatePokemonCard(id, pokemonCard)
        .then((response) => {
          commit('UPDATE_POKEMON_CARD', response.data)
          return response
        })
        .catch((error) => {
          commit('SET_ERROR', error.message || 'Failed to update Pokemon card')
          throw error
        })
        .finally(() => {
          commit('SET_LOADING', false)
        })
    },
    deletePokemonCard({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      return pokemonCardService
        .deletePokemonCard(id)
        .then((response) => {
          commit('REMOVE_POKEMON_CARD', id)
          return response
        })
        .catch((error) => {
          commit('SET_ERROR', error.message || 'Failed to delete Pokemon card')
          throw error
        })
        .finally(() => {
          commit('SET_LOADING', false)
        })
    },
    checkoutCard({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      return pokemonCardService
        .checkoutCard(id)
        .then((response) => {
          commit('UPDATE_POKEMON_CARD', response.data)
          return response
        })
        .catch((error) => {
          commit('SET_ERROR', error.message || 'Failed to checkout Pokemon card')
          throw error
        })
        .finally(() => {
          commit('SET_LOADING', false)
        })
    },
    returnCard({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      return pokemonCardService
        .returnCard(id)
        .then((response) => {
          commit('UPDATE_POKEMON_CARD', response.data)
          return response
        })
        .catch((error) => {
          commit('SET_ERROR', error.message || 'Failed to return Pokemon card')
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
    getAllPokemonCards: (state) => state.pokemonCards,
  },
}
