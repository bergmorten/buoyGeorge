<template>
    <div class="status-radio row items-center">
        <div v-if="label" class="col-auto status-radio-label">
            {{ label }}
        </div>
        <q-icon
            :name="icon"
            :color="color"
            class="col-auto status-radio-icon"
        />
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    color: string;
    label?: string;
    checked: boolean;
}>();
const icon = computed(() => {
    return props.checked ? 'radio_button_checked' : 'radio_button_unchecked';
});
</script>

<style lang="scss" scoped>
.status-radio {
    & &-label {
        vertical-align: middle;
    }
    & &-icon {
        margin-left: 8px;
    }
}
</style>
