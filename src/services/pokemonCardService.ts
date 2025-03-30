import axios from 'axios'
import API_URL from './env'
import { authHeader } from './auth-header'

class PokemonCardService {
  // Get all Pokemon cards
  getPokemonCards() {
    return axios.get(API_URL + 'pokemon-cards', { headers: authHeader() }).then((response) => {
      return response.data
    })
  }

  // Get a specific Pokemon card by ID
  getPokemonCard(id) {
    return axios
      .get(API_URL + `pokemon-cards/${id}`, { headers: authHeader() })
      .then((response) => {
        return response.data
      })
  }

  // Create a new Pokemon card
  createPokemonCard(pokemonCard) {
    return axios
      .post(API_URL + 'pokemon-cards', pokemonCard, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data
      })
  }

  // Update a Pokemon card
  updatePokemonCard(id, pokemonCard) {
    return axios
      .put(API_URL + `pokemon-cards/${id}`, pokemonCard, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data
      })
  }

  // Delete a Pokemon card
  deletePokemonCard(id) {
    return axios
      .delete(API_URL + `pokemon-cards/${id}`, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data
      })
  }
}

const pokemonCardService = new PokemonCardService()
export default pokemonCardService
