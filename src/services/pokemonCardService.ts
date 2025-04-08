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
    // For Laravel PUT requests with file uploads, we need to use POST with method spoofing
    const formData = new FormData()

    // Check if pokemonCard is already a FormData object
    if (pokemonCard instanceof FormData) {
      // Add method spoofing for Laravel
      pokemonCard.append('_method', 'PUT')
      return axios
        .post(API_URL + `pokemon-cards/${id}`, pokemonCard, {
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          return response.data
        })
    } else {
      // Handle cases where pokemonCard is a regular object
      Object.keys(pokemonCard).forEach((key) => {
        if (pokemonCard[key] !== null && pokemonCard[key] !== undefined) {
          formData.append(key, pokemonCard[key])
        }
      })

      // Add method spoofing for Laravel
      formData.append('_method', 'PUT')

      return axios
        .post(API_URL + `pokemon-cards/${id}`, formData, {
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          return response.data
        })
    }
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
