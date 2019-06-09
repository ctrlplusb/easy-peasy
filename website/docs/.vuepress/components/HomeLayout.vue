<template>
  <v-app light>
    <div class="header">
      <img class="logo" src="../../assets/logo.png">
      <h1 class="title">Easy peasy state for React</h1>
    </div>
    <Content :custom="false"/>
  </v-app>
</template>

<style scoped>
.header {
  margin: 30px auto;
  max-width: 900px;
  padding: 0 30px;
  text-align: center;
}

.title {
  font-weight: bold;
  font-size: 2.5rem;
}

.logo {
  width: 120px;
}
</style>