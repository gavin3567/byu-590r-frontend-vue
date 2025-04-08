import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'

export default defineComponent({
  name: 'PokemonCardsView',
  data() {
    return {
      headers: [
        { title: 'Card Image', key: 'card_image', sortable: false, align: 'center' },
        { title: 'Card Name', key: 'name' },
        { title: 'Pokemon', key: 'pokemon_name' },
        { title: 'Type', key: 'energy_type' },
        { title: 'Rarity', key: 'card_rarity' },
        { title: 'Inventory (Available/Total)', key: 'inventory', sortable: false },
        { title: 'Actions', key: 'actions', sortable: false },
      ],
      defaultImage: '/images/default-card.png',

      // Dialog states
      dialog: false,
      deleteDialog: false,
      checkoutDialog: false,

      // Edit/Create form
      isEditMode: false,
      valid: false,
      cardImage: null,
      currentImageUrl: '',

      // Selected card for operations
      cardToDelete: null,
      cardToCheckout: null,

      // Form data
      formData: {
        id: null,
        name: '',
        pokemon_name: '',
        energy_type: '',
        length: '',
        weight: '',
        card_number: '',
        card_rarity: '',
        description: '',
        inventory_total_qty: 1,
        checked_qty: 0,
      },

      // Form validation
      imageRules: [(v) => !this.isEditMode || !!v || 'Image is required for new cards'],
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
    ...mapActions('pokemonCards', [
      'getPokemonCards',
      'createPokemonCard',
      'updatePokemonCard',
      'deletePokemonCard',
      'checkoutCard',
      'returnCard',
    ]),

    // Energy type and rarity color methods (existing)
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

    // Dialog management
    openCreateDialog() {
      this.isEditMode = false
      this.resetForm()
      this.dialog = true
    },

    openEditDialog(card) {
      this.isEditMode = true
      this.formData = { ...card }
      this.currentImageUrl = card.card_image
      this.cardImage = null
      this.dialog = true
    },

    openDeleteDialog(card) {
      this.cardToDelete = card
      this.deleteDialog = true
    },

    closeDialog() {
      this.dialog = false
      this.resetForm()
    },

    resetForm() {
      this.formData = {
        id: null,
        name: '',
        pokemon_name: '',
        energy_type: '',
        length: '',
        weight: '',
        card_number: '',
        card_rarity: '',
        description: '',
        inventory_total_qty: 1,
        checked_qty: 0,
      }
      this.cardImage = null
      this.currentImageUrl = ''

      // Reset form validation
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
    },

    // CRUD operations
    async saveCard() {
      if (!this.valid) return

      // Create FormData object for file upload
      const formData = new FormData()
      Object.keys(this.formData).forEach((key) => {
        if (this.formData[key] !== null && this.formData[key] !== undefined) {
          formData.append(key, this.formData[key])
        }
      })

      // Add card image if selected
      if (this.cardImage) {
        formData.append('card_image', this.cardImage)
      }

      try {
        if (this.isEditMode && this.formData.id) {
          // Update existing card
          await this.updatePokemonCard({
            id: this.formData.id,
            pokemonCard: formData,
          })
          this.$toast?.success('Pokemon card updated successfully')
        } else {
          // Create new card
          await this.createPokemonCard(formData)
          this.$toast?.success('Pokemon card created successfully')
        }
        this.closeDialog()
      } catch (error) {
        console.error('Error saving card:', error)
        this.$toast?.error(error.message || 'Error saving Pokemon card')
      }
    },

    async deleteCard() {
      if (!this.cardToDelete) return

      try {
        await this.deletePokemonCard(this.cardToDelete.id)
        this.$toast?.success('Pokemon card deleted successfully')
        this.deleteDialog = false
        this.cardToDelete = null
      } catch (error) {
        console.error('Error deleting card:', error)
        this.$toast?.error(error.message || 'Error deleting Pokemon card')
      }
    },

    // Checkout/Return operations
    confirmCheckout(card) {
      if (this.isLowStock(card)) {
        this.cardToCheckout = card
        this.checkoutDialog = true
      } else {
        this.proceedWithCheckout(card.id)
      }
    },

    async proceedWithCheckout() {
      if (!this.cardToCheckout) return

      try {
        await this.checkoutCard(this.cardToCheckout.id)
        this.$toast?.success('Pokemon card checked out successfully')
        this.checkoutDialog = false
        this.cardToCheckout = null
      } catch (error) {
        console.error('Error checking out card:', error)
        this.$toast?.error(error.message || 'Error checking out Pokemon card')
      }
    },

    async returnCard(id) {
      try {
        await this.returnCard(id)
        this.$toast?.success('Pokemon card returned successfully')
      } catch (error) {
        console.error('Error returning card:', error)
        this.$toast?.error(error.message || 'Error returning Pokemon card')
      }
    },

    // Helper methods
    isOutOfStock(card) {
      return card.checked_qty >= card.inventory_total_qty
    },

    isLowStock(card) {
      if (!card) return false
      // Consider low stock if only one copy left
      return card.inventory_total_qty - card.checked_qty === 1
    },
  },
})
