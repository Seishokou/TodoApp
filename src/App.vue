<template>
  <v-app>
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-title class="font-weight-bold">
        <v-icon icon="mdi-checkbox-marked-circle-outline" class="mr-2"></v-icon>
        TodoApp
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn to="/" prepend-icon="mdi-view-dashboard">Dashboard & Tasks</v-btn>
      <v-btn to="/about" prepend-icon="mdi-information">About</v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
}
</script>