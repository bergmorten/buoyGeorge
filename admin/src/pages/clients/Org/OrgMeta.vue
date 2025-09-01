<template>
    <q-page
        :style-fn="fullHeight"
        class="column items-center justify-center animated-background"
    >
        <q-card class="q-dialog-plugin meta-page">
            <q-card-section class="text-bold text-h6 text-center">
                Org: {{ state.name }}
            </q-card-section>

            <q-card-section class="q-mt-none">
                <q-form ref="metaForm">
                    <div class="row">
                        <div class="col-4 q-pr-md column">
                            <div class="text-h6 text-center">Primary</div>
                            <q-input
                                v-model="state.name"
                                dense
                                outlined
                                label="Organization name"
                                :rules="[(val) => !!val || 'Field is required']"
                            />
                            <q-input
                                v-model="state.url"
                                dense
                                outlined
                                label="Company homepage"
                                :rules="[isUrlValid]"
                                lazy-rules
                            />

                            <q-input
                                v-model="state.phone"
                                dense
                                outlined
                                label="Company Phone (with country code)"
                                :rules="[isAWSPhone]"
                                lazy-rules
                            />

                            <q-select
                                v-if="orgAdmins && orgAdmins.length"
                                v-model="primaryContact"
                                dense
                                outlined
                                :options="orgAdmins"
                                option-label="name"
                                map-options
                                label="Primary contact"
                                :rules="[(val) => !!val || 'Field is required']"
                            />
                            <div v-else class="text-negative">
                                This organization does not have any org admins.
                                Create org admins under users.
                            </div>
                        </div>
                        <div class="col-4 q-pr-md column">
                            <div class="text-h6 text-center">Address</div>
                            <q-input
                                v-model="state.address1"
                                dense
                                outlined
                                label="Address line 1"
                                :rules="[(val) => !!val || 'Field is required']"
                            />
                            <q-input
                                v-model="state.address2"
                                dense
                                outlined
                                label="Address line 2"
                                :rules="[(val) => true]"
                            />
                            <q-input
                                v-model="state.city"
                                dense
                                outlined
                                label="City"
                                :rules="[(val) => !!val || 'Field is required']"
                            />
                            <q-input
                                v-model="state.state"
                                dense
                                outlined
                                label="State or Province"
                                :rules="[(val) => !!val || 'Field is required']"
                            />
                            <q-input
                                v-model="state.zip"
                                dense
                                outlined
                                label="Zip code"
                                :rules="[(val) => !!val || 'Field is required']"
                            />
                            <q-select
                                v-model="country"
                                dense
                                outlined
                                :options="countries"
                                label="Country"
                                :rules="[(val) => !!val || 'Field is required']"
                            />
                        </div>
                        <div class="col-4 column disabled">
                            <div class="text-h6 text-center">Billing</div>
                            <q-checkbox
                                v-model="billingData.sendQuickBooksInvoice"
                                dense
                                outlined
                                label="Use Quickbooks invoice"
                                disable
                            />
                            <q-input
                                v-model.number="
                                    billingData.quickBooksCustomerId
                                "
                                type="number"
                                dense
                                outlined
                                label="Quickbooks client ID"
                                :disable="!billingData.sendQuickBooksInvoice"
                                :min="0"
                                :rules="[
                                    (val) =>
                                        billingData.sendQuickBooksInvoice ===
                                            false ||
                                        val !== undefined ||
                                        'Field is required',
                                ]"
                            />
                            <q-input
                                v-model.number="billingData.serviceFee"
                                type="number"
                                dense
                                outlined
                                label="Monthly service fee per glider"
                                :min="0"
                                :rules="[
                                    (val) =>
                                        val !== undefined ||
                                        'Field is required',
                                ]"
                                disable
                            />
                            <q-input
                                v-model.number="
                                    billingData.pricePerVirtualGlider
                                "
                                type="number"
                                dense
                                outlined
                                :min="0"
                                label="Virtual glider service fee"
                                :rules="[
                                    (val) =>
                                        val !== undefined ||
                                        'Field is required',
                                ]"
                                disable
                            />
                            <q-input
                                v-model.number="billingData.supportHourPrice"
                                type="number"
                                dense
                                outlined
                                label="Price per support hour"
                                :min="0"
                                :rules="[
                                    (val) =>
                                        val !== undefined ||
                                        'Field is required',
                                ]"
                                disable
                            />
                            <q-checkbox
                                v-model="billingData.extendedSupport"
                                dense
                                outlined
                                disable
                                label="Has extended support"
                            >
                                <q-tooltip
                                    >This is is an option for 24h
                                    support</q-tooltip
                                >
                            </q-checkbox>
                            <q-input
                                v-if="billingData.extendedSupport"
                                v-model.number="billingData.extendedSupportFee"
                                type="number"
                                dense
                                outlined
                                label="Price for extended support"
                                :min="0"
                                :rules="[
                                    (val) =>
                                        val !== undefined ||
                                        'Field is required',
                                ]"
                                disable
                            />
                        </div>
                    </div>

                    <div class="dialog-messages">
                        <div v-if="showHelp" class="dialog-help">
                            This will meta information about a client /
                            organization
                        </div>
                    </div>
                </q-form>
            </q-card-section>
            <q-separator inset />
            <q-card-actions align="right">
                <q-btn label="Help" flat @click="showHelp = !showHelp" />
                <q-btn
                    v-if="hasChanged"
                    label="Reset"
                    flat
                    :disable="working"
                    @click="resetOrg"
                />
                <q-btn
                    v-if="hasChanged"
                    :label="currentOrg ? 'Update' : 'Create'"
                    color="primary"
                    :disable="working"
                    :loading="working"
                    @click="updateOrg"
                />
            </q-card-actions>
        </q-card>
    </q-page>
</template>

<script setup lang="ts">
import {
    computed,
    reactive,
    ref,
    toRaw,
    onMounted,
    onUnmounted,
    getCurrentInstance,
} from 'vue';
import { fullHeight } from 'cmn/composable/helpers';
import { getCodeList, getName } from 'country-list';
import { isAWSPhone, isUrlValid } from 'cmn/lib/validation';
import { isEqual } from 'lodash';
import { logger } from 'cmn/lib/logger';
import { useQuasar } from 'quasar';
import type { QForm } from 'quasar';
import { clientDb } from 'client/services/database';
import type { NewOrg, UpdateOrg } from 'client/services/database/org';
import type { User } from 'client/services/database/users';
import {
    DefaultBillingData,
    type OrgBillingData,
    type ORG_CONTACT_INFO,
} from 'client/services/database/org/models';
import OrgHelp from './OrgHelp.vue';
import { useHelpStore } from 'cmn/stores/help';
const helpStore = useHelpStore();

const $q = useQuasar();

const showHelp = ref(false);
const working = ref(false);
const metaForm = ref<QForm | null>(null);
const billingData = reactive<OrgBillingData>({ ...DefaultBillingData });
const state = reactive({
    id: '',
    name: '',
    url: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
});
const country = ref<undefined | { value: string; label: string }>(undefined);
const primaryContact = ref<User | undefined>(undefined);

const currentOrg = clientDb.organization;
let currentContactInfo: ORG_CONTACT_INFO | undefined;
let currentBillingInfo: OrgBillingData | undefined;
const resetOrg = () => {
    if (!currentOrg.value) {
        state.id = '';
        state.name = '';
        state.url = '';
        state.phone = '';
        state.address1 = '';
        state.address2 = '';
        state.city = '';
        state.state = '';
        state.zip = '';
        Object.assign(billingData, DefaultBillingData);
        return;
    }
    state.id = currentOrg.value.id;
    state.name = currentOrg.value.name;
    state.url = currentOrg.value.url;
    currentContactInfo = (
        typeof currentOrg.value.contactInformation === 'string'
            ? JSON.parse(currentOrg.value.contactInformation)
            : currentOrg.value.contactInformation
    ) as ORG_CONTACT_INFO;
    const orgBillingData = currentOrg.value.billingData
        ? ((typeof currentOrg.value.billingData === 'string'
              ? JSON.parse(currentOrg.value.billingData)
              : toRaw(currentOrg.value.billingData)) as OrgBillingData)
        : DefaultBillingData;
    orgBillingData.sendQuickBooksInvoice =
        orgBillingData.sendQuickBooksInvoice ?? false;

    Object.assign(billingData, orgBillingData);
    currentBillingInfo = { ...orgBillingData }; // proxy hack
    state.phone = currentContactInfo.phone ?? '';
    state.address1 = currentContactInfo.address1 ?? '';
    state.address2 = currentContactInfo.address2 ?? '';
    state.city = currentContactInfo.city ?? '';
    state.state = currentContactInfo.state ?? '';
    state.zip = currentContactInfo.zip ?? '';
    if (currentOrg.value.primaryContactId) {
        primaryContact.value = clientDb.users.get(
            currentOrg.value.primaryContactId,
        );
    }

    if (currentContactInfo && currentContactInfo.country) {
        const countryName = getName(currentContactInfo.country);
        if (countryName)
            country.value = {
                value: currentContactInfo.country,
                label: countryName,
            };
        else country.value = undefined;
    } else country.value = undefined;
};

const orgAdmins = computed(() => {
    const data = clientDb.usersArray.value;

    return data.filter((el) => el.orgAdmin);
});

const countries = Object.entries(getCodeList())
    .map((el) => {
        return { value: el[0], label: el[1] };
    })
    .sort((a, b) => {
        if (a.label > b.label) {
            return 1;
        }
        if (a.label < b.label) {
            return -1;
        }
        return 0;
    });

const updateOrg = async () => {
    if (!metaForm.value || !(await metaForm.value.validate())) {
        logger.warn($q, 'Form values are not correct');
        return;
    }
    working.value = true;
    const countyCode = country.value ? country.value.value : ''; // Yes it is .value.value
    const contactInfo: ORG_CONTACT_INFO = {
        version: 1,
        address1: state.address1,
        address2: state.address2,
        phone: state.phone,
        city: state.city,
        state: state.state,
        zip: state.zip,
        country: countyCode,
    };

    const admin = primaryContact.value ? primaryContact.value : undefined;
    try {
        if (currentOrg.value) {
            const updateOrg: UpdateOrg = {
                id: currentOrg.value.id,
                name: state.name,
                url: state.url,
                contactInformation: JSON.stringify(contactInfo),
                billingData: JSON.stringify(billingData),
                primaryContactId: admin ? admin.id : null,
            };

            await clientDb.org.update(updateOrg);
            resetOrg();
        } else {
            const newOrg: NewOrg = {
                name: state.name,
                url: state.url,
                contactInformation: JSON.stringify(contactInfo),
                primaryContactId: admin ? admin.id : null,
            };

            await clientDb.org.add(newOrg);
            resetOrg();
        }
    } catch (err) {
        logger.error($q, 'Could not save org!', err);
    } finally {
        working.value = false;
    }
};

const hasChanged = computed(() => {
    if (!currentOrg.value) return true;
    if (currentOrg.value.name !== state.name) return true;
    if (currentOrg.value.url !== state.url) return true;
    if (
        (currentOrg.value.primaryContactId ?? null) !==
        (primaryContact.value?.id ?? null)
    )
        return true;
    if (currentContactInfo?.phone !== state.phone) return true;
    if (currentContactInfo?.address1 !== state.address1) return true;
    if (currentContactInfo?.address2 !== state.address2) return true;
    if (currentContactInfo?.city !== state.city) return true;
    if (currentContactInfo?.state !== state.state) return true;
    if (currentContactInfo?.zip !== state.zip) return true;
    if (currentContactInfo?.country !== country.value?.value) return true;

    if (!isEqual(currentBillingInfo, billingData)) return true;
    return false;
});

onMounted(async () => {
    try {
        resetOrg();

        const myName = getCurrentInstance()?.type.__name;

        if (myName)
            helpStore.addHelp({
                name: myName,
                type: 'page',
                helpPage: OrgHelp,
            });
    } catch (err) {
        logger.error($q, 'Could not load org data', err);
    }
});

onUnmounted(() => {
    const myName = getCurrentInstance()?.type.__name;
    if (myName) helpStore.removeHelp(myName);
});
</script>

<style lang="scss">
.meta-page {
    width: 800px;
    max-width: 95vw;
}
</style>
