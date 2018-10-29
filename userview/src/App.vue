<template>
<div>
  <popup></popup>
  <backdrop></backdrop>
    <transition name="card" mode="out-in">
      <router-view></router-view>
    </transition>
</div>
</template>

<style src="./assets/style.scss" lang="scss"></style>
