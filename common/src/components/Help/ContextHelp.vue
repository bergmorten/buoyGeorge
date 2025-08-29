<template>
    <div class="context-help">
        <n-btn round flat icon="close" class="close-btn" @click="close" />
        <component v-if="currentHelp" :is="currentHelp.helpPage" />
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useDrawerStore } from 'cmn/stores/drawer';
import { useHelpStore } from 'cmn/stores/help';

const helpStore = useHelpStore();
const drawerStore = useDrawerStore();

const { currentHelp } = storeToRefs(helpStore);
const close = () => {
    drawerStore.hideHelp();
};
</script>

<style lang="scss">
.context-help {
    margin-top: 16px;
    .close-btn {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 100;
    }

    .titles {
        &.text-container {
            padding: 20px;
            max-width: 300px;
            word-wrap: break-word;
        }
    }

    blockquote {
        &.info {
            background-color: rgba($color: #0f0, $alpha: 0.2);
            padding: 8px;
            &::before {
                content: 'INFO:';
                font-weight: bold;
            }
        }
        &.warning {
            background-color: rgba($color: #ff0, $alpha: 0.2);
            padding: 8px;
            &::before {
                content: 'WARNING:';
                font-weight: bold;
            }
        }
        &.alert {
            background-color: rgba($color: #ff0, $alpha: 0.2);
            padding: 8px;
            &::before {
                content: 'ALERT:';
                font-weight: bold;
            }
        }
    }

    .body-text {
        font-size: 16px;
        line-height: 1.5;
        padding: 16px;
        color: #333;
    }

    .table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;

        th,
        td {
            padding: 12px;
            border: 1px solid #ccc;
            text-align: left;
        }

        th {
            background-color: #f9f9f9;
            font-weight: bold;
        }
    }

    .title {
        font-size: 20px; /* Adjust the font size as needed */
        font-weight: 500;
        margin: 16px 0 0 0;
    }

    .subtitle {
        font-size: 20px;
        font-weight: 500;
        margin: 12px 0;
    }

    .text-container {
        padding: 16px;
        background-color: #f5f5f5;
        border-radius: 8px;
    }

    .header-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }

    .title-container {
        display: flex;
        align-items: center;
    }

    .title-container span {
        margin-left: 10px;
    }

    .chevron-icon {
        margin-left: auto;
    }

    .helper_icon {
        width: 30px;
        height: 30px;
        margin-right: 10px;
    }

    .helper_image {
        width: 200px;
        height: 200px;
        margin-right: 10px;
    }

    .image-container {
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    title {
        font-weight: 800;
        display: block;
        margin-bottom: 5px;
    }
}
</style>
