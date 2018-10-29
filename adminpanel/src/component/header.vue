<template>
<nav v-once>
    <div class="logo"></div>
    <ul>
        <li><router-link :to="{name:'dashboard'}">控制台</router-link></li>
        <li><router-link :to="{name:'posts'}">文章</router-link></li>
        <li><router-link :to="{name:'tags'}">标签</router-link></li>
        <li><router-link :to="{name:'comments'}">评论</router-link></li>
        <li><router-link :to="{name:'users'}">用户</router-link></li>
        <li><router-link :to="{name:'collect'}">特辑管理</router-link></li>
        <li><router-link :to="{name:'global'}">全局配置</router-link></li>
        <li><router-link :to="{name:'logout'}">登出</router-link></li>
    </ul>
</nav>
</template>

<script>
export default {
    name: 'header'
}
</script>
