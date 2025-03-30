<template>
  <div class="pokemon-cards">
    <h1 class="text-h4 mb-4">Pokemon Card Collection</h1>

    <div v-if="loading" class="d-flex justify-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else-if="error" class="error-message">
      <v-alert type="error">{{ error }}</v-alert>
    </div>

    <v-data-table v-else :headers="headers" :items="pokemonCards" class="elevation-1">
      <template v-slot:item.card_image="{ item }">
        <v-avatar size="120" rounded="0">
          <v-img :src="item.card_image || defaultImage" :alt="item.name" contain></v-img>
        </v-avatar>
      </template>

      <template v-slot:item.energy_type="{ item }">
        <v-chip :color="getEnergyTypeColor(item.energy_type)" text-color="white">
          {{ item.energy_type }}
        </v-chip>
      </template>

      <template v-slot:item.card_rarity="{ item }">
        <v-chip :color="getRarityColor(item.card_rarity)" variant="outlined">
          {{ item.card_rarity }}
        </v-chip>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts" src="./PokemonCardsView.ts"></script>
<style lang="scss" src="./PokemonCardsView.scss"></style>
