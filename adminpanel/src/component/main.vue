<template>
<div>
  <suheader></suheader>
  <transition appear name="fade" mode="out-in">
    <router-view></router-view>
  </transition>
</div>
</template>

<script>
export default {
  name: 'main'
}
</script>
