<template>
  <div class="pokemon-cards">
    <h1 class="text-h4 mb-4">Pokemon Card Collection</h1>

    <!-- Add Button -->
    <v-btn color="primary" class="mb-4" @click="openCreateDialog">
      <v-icon left>mdi-plus</v-icon>
      Add New Card
    </v-btn>

    <!-- Loading and Error States -->
    <div v-if="loading" class="d-flex justify-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <div v-else-if="error" class="error-message">
      <v-alert type="error">{{ error }}</v-alert>
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
        <v-chip :color="getEnergyTypeColor(item.energy_type)" text-color="white">
          {{ item.energy_type }}
        </v-chip>
      </template>

      <!-- Card Rarity Column -->
      <template v-slot:item.card_rarity="{ item }">
        <v-chip :color="getRarityColor(item.card_rarity)" variant="outlined">
          {{ item.card_rarity }}
        </v-chip>
      </template>

      <!-- Categories Column (Many-to-Many) -->
      <template v-slot:item.categories="{ item }">
        <div v-if="item.categories && item.categories.length > 0">
          <v-chip
            v-for="category in item.categories"
            :key="category.id"
            size="small"
            class="mr-1 mb-1"
            color="primary"
            variant="outlined"
          >
            {{ category.name }}
          </v-chip>
        </div>
        <div v-else class="text-caption">No categories</div>
      </template>

      <!-- Inventory Column -->
      <template v-slot:item.inventory="{ item }">
        <div>
          {{ item.inventory_total_qty - item.checked_qty }} / {{ item.inventory_total_qty }}
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
              :disabled="isOutOfStock(item)"
              @click="confirmCheckout(item)"
            >
              Checkout
            </v-btn>

            <!-- Return Button -->
            <v-btn
              small
              color="info"
              class="return-button"
              :disabled="item.checked_qty <= 0"
              @click="handleReturnCard(item.id)"
            >
              Return
            </v-btn>
          </div>
        </div>
      </template>
    </v-data-table>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{
            isEditMode ? 'Edit Pokemon Card' : 'Add New Pokemon Card'
          }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid" @submit.prevent="saveCard">
            <v-container>
              <v-row>
                <!-- Form Fields -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.name"
                    label="Card Name"
                    :rules="[(v) => !!v || 'Card name is required']"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.pokemon_name"
                    label="Pokemon Name"
                    :rules="[(v) => !!v || 'Pokemon name is required']"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.energy_type"
                    label="Energy Type"
                    :rules="[(v) => !!v || 'Energy type is required']"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.inventory_total_qty"
                    label="Inventory Quantity"
                    type="number"
                    min="1"
                    :rules="[
                      (v) => !!v || 'Inventory quantity is required',
                      (v) => v >= 1 || 'Quantity must be at least 1',
                    ]"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field v-model="formData.length" label="Length"></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field v-model="formData.weight" label="Weight"></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field v-model="formData.card_number" label="Card Number"></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field v-model="formData.card_rarity" label="Card Rarity"></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="formData.description"
                    label="Description"
                    rows="3"
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
          <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="saveCard" :disabled="!valid">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Delete Pokemon Card</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ cardToDelete?.name }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="red darken-1" text @click="deleteCard">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Checkout Confirmation Dialog -->
    <v-dialog v-model="checkoutDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Checkout Confirmation</v-card-title>
        <v-card-text>
          Are you sure you want to checkout "{{ cardToCheckout?.name }}"?
          {{ isLowStock(cardToCheckout) ? 'This will check out the last available copy.' : '' }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="checkoutDialog = false">Cancel</v-btn>
          <v-btn color="green darken-1" text @click="proceedWithCheckout">Checkout</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Card Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="700px">
      <v-card v-if="selectedCard">
        <v-card-title class="headline">
          {{ selectedCard.name }}
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
                    <p>
                      <strong>Type:</strong>
                      <v-chip
                        small
                        :color="getEnergyTypeColor(selectedCard.energy_type)"
                        text-color="white"
                      >
                        {{ selectedCard.energy_type }}
                      </v-chip>
                    </p>
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
