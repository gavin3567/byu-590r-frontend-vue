import { defineComponent } from 'vue'
import { mapState } from 'vuex'

export default defineComponent({
  name: 'PokemonCardsView',

  data() {
    return {
      headers: [
        { title: 'Card Image', key: 'card_image', sortable: false, align: 'center' },
        { title: 'Card Name', key: 'name' },
        { title: 'Pokemon', key: 'pokemon_name' },
        { title: 'Type', key: 'energy_type' },
        { title: 'Length', key: 'length' },
        { title: 'Weight', key: 'weight' },
        { title: 'Card #', key: 'card_number' },
        { title: 'Rarity', key: 'card_rarity' },
        { title: 'Description', key: 'description' },
      ],
      defaultImage: '/images/default-card.png', // Replace with an actual path
    }
  },

  computed: {
    ...mapState({
      pokemonCards: (state) => state.pokemonCards.pokemonCards,
      loading: (state) => state.pokemonCards.loading,
      error: (state) => state.pokemonCards.error,
    }),
  },

  created() {
    this.getPokemonCards()
  },

  methods: {
    getPokemonCards() {
      this.$store.dispatch('pokemonCards/getPokemonCards')
    },

    getEnergyTypeColor(type) {
      const colors = {
        Fire: 'red',
        Water: 'blue',
        Grass: 'green',
        Electric: 'amber-darken-2',
        Psychic: 'purple',
        Fighting: 'brown',
        Dark: 'grey-darken-3',
        Metal: 'grey',
        Fairy: 'pink',
        Dragon: 'deep-orange',
        Colorless: 'grey-lighten-1',
      }

      return colors[type] || 'blue-grey'
    },

    getRarityColor(rarity) {
      const colors = {
        Common: 'grey',
        Uncommon: 'blue',
        Rare: 'purple',
        'Ultra Rare': 'amber-darken-2',
        'Secret Rare': 'red-darken-2',
      }

      return colors[rarity] || 'blue-grey'
    },
  },
})
