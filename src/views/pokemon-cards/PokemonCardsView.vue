<template>
  <div class="pokemon-cards">
    <h1 class="text-h4 mb-4">Pokemon Card Collection</h1>

    <!-- Add Button with Loading State -->
    <v-btn
      color="primary"
      class="mb-4"
      @click="openCreateDialog"
      :disabled="loading || isPageActionInProgress"
    >
      <v-icon left>mdi-plus</v-icon>
      Add New Card
    </v-btn>

    <!-- Loading and Error States -->
    <div v-if="loading" class="d-flex justify-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <div v-else-if="error" class="error-message">
      <v-alert type="error">
        {{ error }}
        <v-btn
          text
          color="white"
          small
          @click="retryLoading"
          class="mt-2"
          :loading="isRetrying"
          :disabled="isRetrying"
        >
          Retry
        </v-btn>
      </v-alert>
    </div>

    <!-- Pokemon Cards Table - Using full width -->
    <v-data-table
      v-else
      :headers="headers"
      :items="pokemonCards"
      class="elevation-1 full-width-table"
      :items-per-page="10"
      :disable-sort="false"
      :disable-pagination="false"
      :footer-props="{
        'items-per-page-options': [10, 25, 50, -1],
        'items-per-page-text': 'Cards per page',
      }"
      :mobile-breakpoint="600"
    >
      <!-- Card Image Column -->
      <template v-slot:item.card_image="{ item }">
        <div class="card-image-container" :class="{ 'out-of-stock': isOutOfStock(item) }">
          <v-avatar size="120" rounded="0">
            <v-img :src="item.card_image || defaultImage" :alt="item.name" contain></v-img>
          </v-avatar>
          <div v-if="isOutOfStock(item)" class="out-of-stock-overlay">Out of Stock</div>
        </div>
      </template>

      <!-- Energy Type Column -->
      <template v-slot:item.energy_type="{ item }">
        <div class="energy-types-container">
          <v-chip
            v-for="type in getEnergyTypes(item.energy_type)"
            :key="type"
            :color="getEnergyTypeColor(type)"
            text-color="white"
            class="mr-1 mb-1"
            small
          >
            {{ type }}
          </v-chip>
        </div>
      </template>

      <!-- Card Rarity Column -->
      <template v-slot:item.card_rarity="{ item }">
        <v-chip :color="getRarityColor(item.card_rarity)" variant="outlined">
          {{ item.card_rarity }}
        </v-chip>
      </template>

      <!-- Inventory Column -->
      <template v-slot:item.inventory="{ item }">
        <div class="inventory-display">
          <span class="available">{{ item.inventory_total_qty - item.checked_qty }}</span>
          <span class="total-separator">/</span>
          <span class="total">{{ item.inventory_total_qty }}</span>
        </div>
      </template>

      <!-- Actions Column -->
      <template v-slot:item.actions="{ item }">
        <div class="action-buttons-container">
          <!-- Edit Button -->
          <v-btn icon small class="action-button" @click="openEditDialog(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>

          <!-- Delete Button -->
          <v-btn icon small color="error" class="action-button" @click="openDeleteDialog(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>

          <!-- View Details Button -->
          <v-btn icon small color="primary" class="action-button" @click="openDetailsDialog(item)">
            <v-icon>mdi-information-outline</v-icon>
          </v-btn>

          <div class="checkout-return-container">
            <!-- Checkout Button -->
            <v-btn
              small
              color="success"
              class="checkout-button"
              :disabled="isOutOfStock(item) || isActionInProgress(item.id, 'checkout')"
              :loading="isActionInProgress(item.id, 'checkout')"
              @click="confirmCheckout(item)"
            >
              Checkout
            </v-btn>

            <!-- Return Button -->
            <v-btn
              small
              color="info"
              class="return-button"
              :disabled="item.checked_qty <= 0 || isActionInProgress(item.id, 'return')"
              :loading="isActionInProgress(item.id, 'return')"
              @click="handleReturnCard(item.id)"
            >
              Return
            </v-btn>
          </div>
        </div>
      </template>
    </v-data-table>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="800px" fullscreen-breakpoint="600">
      <v-card>
        <v-card-title class="headline primary white--text">
          <span>{{ isEditMode ? 'Edit Pokemon Card' : 'Add New Pokemon Card' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="closeDialog" :disabled="isSubmitting">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid" @submit.prevent="validateAndSubmit">
            <v-container>
              <!-- Form validation status -->
              <v-row v-if="hasFormErrors">
                <v-col cols="12">
                  <v-alert dense type="error" class="validation-error mb-4">
                    Please correct the errors before submitting the form.
                  </v-alert>
                </v-col>
              </v-row>
              <v-row>
                <!-- Form Fields -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.name"
                    label="Card Name"
                    :rules="nameRules"
                    :error-messages="fieldErrors.name"
                    counter="100"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.pokemon_name"
                    label="Pokemon Name"
                    :rules="pokemonNameRules"
                    :error-messages="fieldErrors.pokemon_name"
                    counter="50"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <label class="text-subtitle-1 font-weight-medium mb-2 d-block"
                    >Energy Type(s)</label
                  >
                  <div class="energy-type-checkboxes mt-2">
                    <v-checkbox
                      v-for="type in availableEnergyTypes"
                      :key="type"
                      v-model="selectedEnergyTypes"
                      :value="type"
                      :label="type"
                      :color="getEnergyTypeColor(type)"
                      hide-details
                      class="energy-type-checkbox ma-0 pa-0"
                      dense
                    ></v-checkbox>
                  </div>
                  <div class="selected-energy-types mt-2">
                    <v-chip
                      v-for="type in selectedEnergyTypes"
                      :key="type"
                      :color="getEnergyTypeColor(type)"
                      text-color="white"
                      class="mr-1 mb-1"
                      small
                      close
                      @click:close="removeEnergyType(type)"
                    >
                      {{ type }}
                    </v-chip>
                  </div>
                  <div
                    v-if="selectedEnergyTypes.length === 0 || fieldErrors.energy_type"
                    class="error-text mt-1"
                  >
                    {{ fieldErrors.energy_type || 'Energy type is required' }}
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.inventory_total_qty"
                    label="Inventory Quantity"
                    type="number"
                    min="1"
                    :rules="inventoryRules"
                    :error-messages="fieldErrors.inventory_total_qty"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.length"
                    label="Length"
                    :rules="lengthRules"
                    :error-messages="fieldErrors.length"
                    hint="Enter length in cm"
                    persistent-hint
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.weight"
                    label="Weight"
                    :rules="weightRules"
                    :error-messages="fieldErrors.weight"
                    hint="Enter weight in grams"
                    persistent-hint
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.card_number"
                    label="Card Number"
                    :rules="cardNumberRules"
                    :error-messages="fieldErrors.card_number"
                    required
                    hint="Required - Format: 123/456 or SM01"
                    persistent-hint
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    v-model="formData.card_rarity"
                    :items="['Common', 'Uncommon', 'Rare', 'Ultra Rare', 'Secret Rare']"
                    label="Card Rarity"
                    :rules="rarityRules"
                    :error-messages="fieldErrors.card_rarity"
                    required
                  ></v-select>
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="formData.description"
                    label="Description"
                    rows="3"
                    :rules="descriptionRules"
                    :error-messages="fieldErrors.description"
                    counter="500"
                    required
                    hint="Required - Maximum 500 characters"
                    persistent-hint
                  ></v-textarea>
                </v-col>

                <v-col cols="12">
                  <v-file-input
                    v-model="cardImage"
                    :rules="imageRules"
                    accept="image/*"
                    label="Card Image"
                    prepend-icon="mdi-camera"
                    :required="!isEditMode"
                    :error-messages="fieldErrors.card_image"
                    hint="Max file size: 5MB"
                    persistent-hint
                    show-size
                  ></v-file-input>
                </v-col>

                <!-- Preview current image if in edit mode -->
                <v-col v-if="isEditMode && currentImageUrl" cols="12" class="text-center">
                  <p>Current Image:</p>
                  <v-img
                    :src="currentImageUrl"
                    max-width="200"
                    contain
                    class="mx-auto mb-4"
                  ></v-img>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog" :disabled="isSubmitting"
            >Cancel</v-btn
          >
          <v-btn
            color="blue darken-1"
            text
            @click="validateAndSubmit"
            :disabled="!valid || selectedEnergyTypes.length === 0 || isSubmitting"
            :loading="isSubmitting"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px" fullscreen-breakpoint="600">
      <v-card>
        <v-card-title class="text-h5 error white--text">Delete Pokemon Card</v-card-title>
        <v-card-text class="pt-4">
          Are you sure you want to delete "{{ cardToDelete?.name }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteDialog = false" :disabled="isDeleting"
            >Cancel</v-btn
          >
          <v-btn
            color="red darken-1"
            text
            @click="deleteCard"
            :disabled="isDeleting"
            :loading="isDeleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Checkout Confirmation Dialog -->
    <v-dialog v-model="checkoutDialog" max-width="400px" fullscreen-breakpoint="600">
      <v-card>
        <v-card-title class="text-h5 success white--text">Checkout Confirmation</v-card-title>
        <v-card-text class="pt-4">
          Are you sure you want to checkout "{{ cardToCheckout?.name }}"?
          {{ isLowStock(cardToCheckout) ? 'This will check out the last available copy.' : '' }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="checkoutDialog = false"
            :disabled="isCheckingOut"
          >
            Cancel
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="proceedWithCheckout"
            :disabled="isCheckingOut"
            :loading="isCheckingOut"
          >
            Checkout
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Card Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="700px" fullscreen-breakpoint="600">
      <v-card v-if="selectedCard">
        <v-card-title class="headline primary white--text">
          {{ selectedCard.name }}
          <v-spacer></v-spacer>
          <v-btn icon dark @click="detailsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <!-- Card Image -->
              <v-col cols="12" sm="4" class="text-center">
                <v-img
                  :src="selectedCard.card_image"
                  max-height="250"
                  contain
                  class="mx-auto mb-4"
                ></v-img>
              </v-col>

              <!-- Card Basic Info -->
              <v-col cols="12" sm="8">
                <v-row>
                  <v-col cols="6">
                    <p><strong>Pokemon:</strong> {{ selectedCard.pokemon_name }}</p>
                    <p><strong>Type:</strong></p>
                    <div class="mt-1 mb-2">
                      <v-chip
                        v-for="type in getEnergyTypes(selectedCard.energy_type)"
                        :key="type"
                        small
                        :color="getEnergyTypeColor(type)"
                        text-color="white"
                        class="mr-1"
                      >
                        {{ type }}
                      </v-chip>
                    </div>
                    <p><strong>Card Number:</strong> {{ selectedCard.card_number }}</p>
                  </v-col>
                  <v-col cols="6">
                    <p>
                      <strong>Rarity:</strong>
                      <v-chip
                        small
                        :color="getRarityColor(selectedCard.card_rarity)"
                        variant="outlined"
                      >
                        {{ selectedCard.card_rarity }}
                      </v-chip>
                    </p>
                    <p><strong>Length:</strong> {{ selectedCard.length }}</p>
                    <p><strong>Weight:</strong> {{ selectedCard.weight }}</p>
                  </v-col>
                </v-row>
                <p class="mt-2"><strong>Description:</strong> {{ selectedCard.description }}</p>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="detailsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" src="./PokemonCardsView.ts"></script>
<style lang="scss" src="./PokemonCardsView.scss"></style>
