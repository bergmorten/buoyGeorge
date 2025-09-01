<template>
    <q-page
        :style-fn="fullHeight"
        class="column items-center justify-center animated-background"
    >
        <q-card class="q-mt-lg org-card">
            <q-card-section>
                <div class="text-h6 text-center">
                    Organization information
                    <q-tooltip>
                        {{ organization?.id }}
                    </q-tooltip>
                </div>
            </q-card-section>
            <q-card-section>
                <div class="row justify-center">
                    <div class="col-auto q-mr-xl">
                        <q-img
                            :src="`${orgImage}`"
                            spinner-color="white"
                            class="org-image q-py-xs rounded-borders"
                            :ratio="1"
                        >
                            <div v-if="hasOrgImage" class="absolute-top-right">
                                <q-btn
                                    flat
                                    dense
                                    icon="close"
                                    class="q-pa-none q-ma-none"
                                    @click="deleteOrgImage"
                                />
                            </div>
                            <div
                                class="absolute-bottom text-center q-pa-xs q-ma-none"
                            >
                                <q-btn
                                    flat
                                    dense
                                    label="change"
                                    :percentage="uploadPercentage"
                                    :loading="uploading"
                                    @click="changeOrgImage"
                                />
                            </div>
                        </q-img>
                        <div class="text-center">Organization image</div>
                    </div>
                    <div
                        v-if="organization"
                        class="col-auto column justify-center q-gutter-y-sm"
                    >
                        <div>
                            <strong class="q-mr-sm">Username:</strong>
                            {{ organization.name }}
                        </div>
                        <div>
                            <strong class="q-mr-sm">Home page:</strong>
                            {{ organization.url }}
                            <q-icon
                                name="launch"
                                class="cursor-pointer"
                                @click="
                                    openURL(
                                        organization ? organization.url : '',
                                    )
                                "
                            />
                        </div>
                        <template v-if="contactInfo">
                            <div>
                                <strong class="q-mr-sm">Address:</strong>
                                {{ contactInfo.address1 }}
                            </div>
                            <div v-if="contactInfo.address2">
                                <strong class="q-mr-sm">Address:</strong>
                                {{ contactInfo.address2 }}
                            </div>
                            <div>
                                <strong class="q-mr-sm">State:</strong>
                                {{ contactInfo.state }}
                            </div>
                            <div>
                                <strong class="q-mr-sm">City:</strong>
                                {{ contactInfo.city }}
                            </div>
                            <div>
                                <strong class="q-mr-sm">Zip:</strong>
                                {{ contactInfo.zip }}
                            </div>
                            <div>
                                <strong class="q-mr-sm">County:</strong>
                                {{ contactInfo.country }}
                            </div>
                        </template>
                    </div>
                    <div v-else class="col-2 self-center row justify-center">
                        <q-spinner size="xl" />
                    </div>
                </div>
            </q-card-section>
            <q-card-section>
                <div class="text-center text-weight-bold">
                    Contact Nortek Group if this information is incorrect
                </div>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { downloadData, getUrl, remove, uploadData } from 'aws-amplify/storage';
import { fullHeight } from 'cmn/composable/helpers';
import { getName as getCountryName } from 'country-list';
import { logger } from 'cmn/lib/logger';
import { openURL, useQuasar } from 'quasar';
import { db } from 'client/services/database';
import type { ORG_CONTACT_INFO } from 'client/services/database/org/models';
import UploadSVG from 'client/assets/svg/upload.svg';
import OrgHelp from './OrgHelp.vue';
import { useHelpStore } from 'cmn/stores/help';
const helpStore = useHelpStore();
const $q = useQuasar();
const orgImage = ref<string | ArrayBuffer | null>(UploadSVG);
const hasOrgImage = ref(false);
const uploadPercentage = ref(0);
const uploading = ref(false);
let fileHandle: FileSystemFileHandle | undefined = undefined;

const organization = db.organization;

const contactInfo = computed<ORG_CONTACT_INFO | null>(() => {
    const orgEntry = organization.value;
    if (!orgEntry) return null;

    try {
        const info = JSON.parse(
            orgEntry.contactInformation,
        ) as ORG_CONTACT_INFO;
        const fullCountryName = getCountryName(info.country);
        if (fullCountryName) info.country = fullCountryName;
        return info;
    } catch (error) {
        logger.error($q, 'Failed to parse org contact information', error);
        return null;
    }
});

const storageFilenameOrg = () => {
    const fileName = `public/orgImages/logo.image`;
    return fileName;
};

const storeOrgImage = async () => {
    if (!fileHandle) return;

    const file = await fileHandle.getFile();
    if (file.size > 1024 * 1024 * 16) {
        logger.error($q, 'File size is too large (max 16 mb)');
        return;
    }

    const type = file.type;
    if (!['image/jpeg', 'image/png'].includes(type)) {
        logger.error(
            $q,
            'Filetype is not supported, only jpg og png is supported',
        );
        return;
    }
    try {
        const fileName = storageFilenameOrg();
        uploadPercentage.value = 0;
        uploading.value = true;

        await uploadData({
            path: fileName,
            data: file,
            options: {
                bucket: 'main',
                contentType: type,
                onProgress: (progress) => {
                    if (progress.totalBytes)
                        uploadPercentage.value =
                            (100 * progress.transferredBytes) /
                            progress.totalBytes;
                },
            },
        }).result;

        uploadPercentage.value = 100;
        uploading.value = false;
        hasOrgImage.value = true;
    } catch (err) {
        logger.error($q, 'Could not upload fleet image', err);
    }
};

const setImage = (input: File | Blob) => {
    const reader = new FileReader();
    reader.onload = function (e) {
        if (e.target) orgImage.value = e.target.result;
    };
    reader.readAsDataURL(input);
};

const changeOrgImage = async () => {
    const pickerOpts: OpenFilePickerOptions = {
        types: [
            {
                description: 'Images',
                accept: {
                    'image/svg+xml': ['.svg', '.png'],
                },
            },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
    };
    [fileHandle] = await window.showOpenFilePicker(pickerOpts);
    if (!fileHandle) {
        logger.error($q, 'File handle is invalid');
        return;
    }
    const file = await fileHandle.getFile();

    if (file.size > 1024 * 1024 * 16) {
        logger.error($q, 'File size is too large (max 16 mb)');
        return;
    }
    setImage(file);
    await storeOrgImage();
};

const deleteOrgImage = async () => {
    try {
        const fileName = storageFilenameOrg();
        await remove({ path: fileName, options: { bucket: 'main' } });
        orgImage.value = UploadSVG;
        hasOrgImage.value = false;
    } catch (err) {
        logger.warn($q, 'Could not remove org image', err);
    }
};

onMounted(async () => {
    try {
        const fileName = storageFilenameOrg();

        // throws error if file does not exist
        await getUrl({
            path: fileName,
            options: {
                bucket: 'main',
                validateObjectExistence: true,
            },
        });

        const image = await downloadData({
            path: fileName,
            options: { bucket: 'main' },
        }).result;

        if (image) {
            const contentBlob = await image.body.blob();
            setImage(contentBlob);
            hasOrgImage.value = true;
        }
    } catch (e) {
        // Not a critical error, just log it
        if (process.env.NODE_ENV === 'development') {
            console.error(e);
        }
    }
    const myName = getCurrentInstance()?.type.__name;

    if (myName)
        helpStore.addHelp({
            name: myName,
            type: 'page',
            helpPage: OrgHelp,
        });
});

onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss" scoped>
.org-card {
    width: 600px;
    max-width: 95vw;
    height: auto;

    .org-image {
        width: 200px;
        height: 200px;
    }
}
</style>
