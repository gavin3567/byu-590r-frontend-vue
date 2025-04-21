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
      detailsDialog: false,
      // Edit/Create form
      isEditMode: false,
      valid: true,
      cardImage: null,
      currentImageUrl: '',
      // Operation states
      isSubmitting: false,
      isDeleting: false,
      isCheckingOut: false,
      isReturning: false,
      isRetrying: false,
      activeOperations: {}, // Tracks operations in progress by card ID
      // Field validation errors
      fieldErrors: {},
      // Selected card for operations
      cardToDelete: null,
      cardToCheckout: null,
      selectedCard: null,
      // Energy Types management
      availableEnergyTypes: [
        'Fire',
        'Water',
        'Grass',
        'Electric',
        'Psychic',
        'Fighting',
        'Dark',
        'Metal',
        'Fairy',
        'Dragon',
        'Colorless',
      ],
      selectedEnergyTypes: [],
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
      nameRules: [
        (v) => !!v || 'Card name is required',
        (v) => (v && v.length <= 100) || 'Card name must be less than 100 characters',
      ],
      pokemonNameRules: [
        (v) => !!v || 'Pokemon name is required',
        (v) => (v && v.length <= 50) || 'Pokemon name must be less than 50 characters',
      ],
      energyTypeRules: [(v) => !!v || 'Energy type is required'],
      inventoryRules: [
        (v) => !!v || 'Inventory quantity is required',
        (v) => v >= 1 || 'Quantity must be at least 1',
        (v) => Number.isInteger(Number(v)) || 'Quantity must be a whole number',
      ],
      lengthRules: [(v) => !v || /^\d+(\.\d+)?$/.test(v) || 'Length must be a valid number'],
      weightRules: [(v) => !v || /^\d+(\.\d+)?$/.test(v) || 'Weight must be a valid number'],
      cardNumberRules: [
        (v) =>
          !v ||
          /^[A-Za-z0-9\-\/]+$/.test(v) ||
          'Card number must contain only alphanumeric characters, hyphens, and slashes',
      ],
      rarityRules: [
        (v) => !!v || 'Card rarity is required',
        (v) =>
          (v && ['Common', 'Uncommon', 'Rare', 'Ultra Rare', 'Secret Rare'].includes(v)) ||
          'Please enter a valid rarity',
      ],
      descriptionRules: [
        (v) => (v && v.length <= 500) || 'Description must be less than 500 characters',
      ],
      imageRules: [
        (v) => this.isEditMode || !!v || 'Image is required for new cards',
        (v) => !v || (v && v.size < 5000000) || 'Image size should be less than 5MB',
      ],
    }
  },
  computed: {
    ...mapState({
      pokemonCards: (state) => state.pokemonCards.pokemonCards,
      loading: (state) => state.pokemonCards.loading,
      error: (state) => state.pokemonCards.error,
    }),

    hasFormErrors() {
      return (
        Object.keys(this.fieldErrors).length > 0 ||
        (this.selectedEnergyTypes.length === 0 && this.dialog)
      )
    },

    // Check if any page-level operations are in progress
    isPageActionInProgress() {
      return (
        this.isSubmitting ||
        this.isDeleting ||
        this.isCheckingOut ||
        this.isReturning ||
        this.loading
      )
    },
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
      'returnCard', // This maps to store action with same name
    ]),

    // Retry loading cards after an error
    async retryLoading() {
      if (this.isRetrying) return

      this.isRetrying = true
      try {
        await this.getPokemonCards()
      } catch (error) {
        console.error('Error retrying load:', error)
      } finally {
        this.isRetrying = false
      }
    },

    // Energy type and rarity color methods
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

    // Get energy types as array from string
    getEnergyTypes(energyTypeString) {
      if (!energyTypeString) return []
      return energyTypeString.split(',').map((type) => type.trim())
    },

    // Remove energy type from selection
    removeEnergyType(type) {
      const index = this.selectedEnergyTypes.indexOf(type)
      if (index !== -1) {
        this.selectedEnergyTypes.splice(index, 1)
      }
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
      this.valid = true

      // Initialize with empty selection for energy types
      this.selectedEnergyTypes = []
    },

    openEditDialog(card) {
      this.isEditMode = true
      this.formData = { ...card }
      this.currentImageUrl = card.card_image
      this.cardImage = null

      // Parse energy types from string to array for the dropdown
      this.selectedEnergyTypes = this.getEnergyTypes(card.energy_type)

      this.dialog = true
      this.valid = true
    },

    openDetailsDialog(card) {
      this.selectedCard = card
      this.detailsDialog = true
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
      this.selectedEnergyTypes = []
      this.valid = true
      this.fieldErrors = {} // Reset field-specific errors

      // Reset form validation
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
    },

    // Format date for display
    formatDate(dateString) {
      if (!dateString) return 'Unknown'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString()
      } catch (e) {
        return dateString
      }
    },

    // Validate and submit form
    validateAndSubmit() {
      // Clear previous errors
      this.fieldErrors = {}

      // Validate the form using Vuetify's validation
      if (!this.$refs.form.validate()) {
        this.$toast?.error('Please correct the form errors before submitting')
        return
      }

      // Validate energy types
      if (this.selectedEnergyTypes.length === 0) {
        this.fieldErrors.energy_type = 'At least one energy type is required'
        this.$toast?.error('Please select at least one energy type')
        return
      }

      // All validation passed, save the card
      this.saveCard()
    },

    // Validate all fields before submission
    validateForm() {
      // Reset field errors
      this.fieldErrors = {}

      // Check if energy types are selected
      if (this.selectedEnergyTypes.length === 0) {
        this.fieldErrors.energy_type = 'At least one energy type is required'
        return false
      }

      // Check if the form is valid according to Vuetify
      if (!this.$refs.form.validate()) {
        return false
      }

      return true
    },

    // Handle backend validation errors
    handleBackendValidationErrors(error) {
      // Reset field errors
      this.fieldErrors = {}

      if (error.response && error.response.status === 422) {
        // Process validation errors from backend
        const validationErrors = error.response.data.errors || {}

        // Map backend errors to fields
        Object.keys(validationErrors).forEach((field) => {
          this.fieldErrors[field] = validationErrors[field][0]
        })

        // Scroll to the first error
        this.$nextTick(() => {
          const firstErrorElement = document.querySelector('.error--text')
          if (firstErrorElement) {
            firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        })

        return true // Validation errors handled
      }

      return false // Not a validation error
    },

    // CRUD operations
    async saveCard() {
      // Don't submit if already submitting (prevent duplicate submissions)
      if (this.isSubmitting) return

      // Validate form
      if (!this.validateForm()) return

      this.isSubmitting = true

      // Join selected energy types into a comma-separated string
      this.formData.energy_type = this.selectedEnergyTypes.join(', ')

      // Create FormData object for file upload
      const formData = new FormData()

      // Add all form fields except card_image
      Object.keys(this.formData).forEach((key) => {
        // Skip the card_image field as we'll handle it separately
        if (key !== 'card_image' && key !== 'created_at' && key !== 'updated_at') {
          if (this.formData[key] !== null && this.formData[key] !== undefined) {
            formData.append(key, this.formData[key])
          }
        }
      })

      // Add card image if selected - make sure it's a valid file object
      if (this.cardImage) {
        // Check if it's an array or a single file
        if (Array.isArray(this.cardImage) && this.cardImage.length > 0) {
          formData.append('card_image', this.cardImage[0])
        } else if (this.cardImage instanceof File) {
          formData.append('card_image', this.cardImage)
        }
      } else if (this.isEditMode) {
        // If in edit mode with no new image, tell the server to keep the existing image
        formData.append('_keep_existing_image', '1')
      }

      try {
        if (this.isEditMode && this.formData.id) {
          // Update existing card
          await this.updatePokemonCard({
            id: this.formData.id,
            pokemonCard: formData,
          })
          this.$toast?.success('Pokemon card updated successfully')
          this.closeDialog()
        } else {
          // Create new card
          await this.createPokemonCard(formData)
          this.$toast?.success('Pokemon card created successfully')
          this.closeDialog()
        }
      } catch (error) {
        console.error('Error saving card:', error)

        // Check if these are validation errors
        if (!this.handleBackendValidationErrors(error)) {
          // If not validation errors, show generic error
          const errorMsg = error.response?.data?.message || 'Error saving Pokemon card'
          this.$toast?.error(errorMsg)
        }
      } finally {
        this.isSubmitting = false
      }
    },

    async deleteCard() {
      if (!this.cardToDelete || this.isDeleting) return

      this.isDeleting = true

      try {
        await this.deletePokemonCard(this.cardToDelete.id)
        this.$toast?.success('Pokemon card deleted successfully')
        this.deleteDialog = false
        this.cardToDelete = null
      } catch (error) {
        console.error('Error deleting card:', error)
        this.$toast?.error(error.response?.data?.message || 'Error deleting Pokemon card')
      } finally {
        this.isDeleting = false
      }
    },

    // Checkout/Return operations
    confirmCheckout(card) {
      this.cardToCheckout = card
      this.checkoutDialog = true
    },

    async proceedWithCheckout() {
      if (!this.cardToCheckout || this.isCheckingOut) return

      this.isCheckingOut = true
      const cardId = this.cardToCheckout.id
      this.setActionInProgress(cardId, 'checkout', true)

      try {
        await this.checkoutCard(cardId)
        this.$toast?.success('Pokemon card checked out successfully')
        this.checkoutDialog = false
        this.cardToCheckout = null
      } catch (error) {
        console.error('Error checking out card:', error)

        // Handle specific validation errors
        if (error.response?.status === 422) {
          const errorMessage = error.response.data.message || 'Error checking out Pokemon card'
          this.$toast?.error(errorMessage)
        } else if (error.response?.status === 409) {
          // Conflict - card might already be out of stock
          this.$toast?.error('This card is no longer available for checkout')
        } else {
          this.$toast?.error('Error checking out Pokemon card')
        }
      } finally {
        this.isCheckingOut = false
        this.setActionInProgress(cardId, 'checkout', false)
      }
    },

    async handleReturnCard(id) {
      if (this.isActionInProgress(id, 'return')) return

      this.setActionInProgress(id, 'return', true)

      try {
        await this.returnCard(id) // This uses the Vuex action
        this.$toast?.success('Pokemon card returned successfully')
      } catch (error) {
        console.error('Error returning card:', error)
        this.$toast?.error(error.response?.data?.message || 'Error returning Pokemon card')
      } finally {
        this.setActionInProgress(id, 'return', false)
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

    // Track operations in progress by card ID and operation type
    setActionInProgress(cardId, action, status) {
      if (!this.activeOperations[cardId]) {
        this.activeOperations[cardId] = {}
      }
      this.activeOperations[cardId][action] = status

      // Use Vue.set for reactivity
      this.$set(this.activeOperations, cardId, { ...this.activeOperations[cardId] })
    },

    isActionInProgress(cardId, action) {
      return this.activeOperations[cardId]?.[action] === true
    },
  },
})
