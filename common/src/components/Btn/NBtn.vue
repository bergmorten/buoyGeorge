<template>
    <q-btn
        unelevated
        :class="{
            'btn-active': active,
            'btn-danger': danger,
        }"
    >
        <slot />
    </q-btn>
</template>

<script setup lang="ts">
defineProps<{
    active?: boolean;
    danger?: boolean;
}>();
</script>

<style lang="scss">
.btn {
    &-active {
        background: $active-color !important;
        color: $active-inverted-color !important;
    }
    &-danger {
        background: $negative !important;
        color: #fff !important;
    }
}
</style>
