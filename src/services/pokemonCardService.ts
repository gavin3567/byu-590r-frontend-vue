// src/services/pokemonCardService.ts
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
        headers: {
          ...authHeader(),
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      })
      .then((response) => {
        return response.data
      })
  }

  // Update a Pokemon card
  updatePokemonCard(id, pokemonCard) {
    return axios
      .post(
        API_URL + `pokemon-cards/${id}`,
        {
          ...pokemonCard,
          _method: 'PUT', // Laravel method spoofing for file uploads
        },
        {
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        }
      )
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

  // Checkout a Pokemon card
  checkoutCard(id) {
    return axios
      .patch(
        API_URL + `pokemon-cards/${id}/checkout`,
        {},
        {
          headers: authHeader(),
        }
      )
      .then((response) => {
        return response.data
      })
  }

  // Return a Pokemon card
  returnCard(id) {
    return axios
      .patch(
        API_URL + `pokemon-cards/${id}/return`,
        {},
        {
          headers: authHeader(),
        }
      )
      .then((response) => {
        return response.data
      })
  }
}

const pokemonCardService = new PokemonCardService()
export default pokemonCardService
