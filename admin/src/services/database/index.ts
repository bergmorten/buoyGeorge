import { shallowReactive, ref } from 'vue';
import client, { type Client } from './client';
import modem, { type Modem } from './modem';
import { ConnectionState } from 'aws-amplify/data';
import { CONNECTION_STATE_CHANGE } from 'aws-amplify/data';
import { Hub } from 'aws-amplify/utils';
import Bugsnag from '@bugsnag/js';
import { Notify } from 'quasar';

const useDatabase = () => {
    const clients = shallowReactive<Map<string, Client>>(new Map());
    const modems = shallowReactive<Map<string, Modem>>(new Map());

    let hasStarted = false;
    const isConnected = ref(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Hub.listen('api', (data: any) => {
        const { payload } = data;
        if (payload.event === CONNECTION_STATE_CHANGE) {
            const connectionState = payload.data
                .connectionState as ConnectionState;
            console.log(`Connection state changed: ${connectionState}`);
            if (connectionState === ConnectionState.Connected) {
                console.log('Connection established');
                isConnected.value = true;
                if (hasStarted) {
                    syncSubscriptions();
                }
            } else {
                console.warn('Connection lost');
                isConnected.value = false;
            }
        }
    });

    const clear = () => {
        clients.clear();
        modems.clear();
    };

    const sync = async () => {
        try {
            clear();
            const allClients = await client.getAll(false);
            allClients.forEach((c) => clients.set(c.id, c));
            const allModems = await modem.getAll();
            allModems.forEach((m) => modems.set(m.id, m));
        } catch (error) {
            console.error('Error syncing database', error);
            Notify.create({
                type: 'negative',
                message: 'Failed to sync database',
            });
            Bugsnag.notify(error as Error);
        }
    };
    const start = async () => {
        clear();
        client.startSubscriptions(clients);
        modem.startSubscriptions(modems);

        await sync();
        hasStarted = true;
    };

    const stop = () => {
        client.stopSubscriptions();
        modem.stopSubscriptions();

        hasStarted = false;
    };

    const syncSubscriptions = async () => {
        // In amplify gen 1 we had _deleted which we could use to identify deleted users and then sync from last connected time
        clear();
        await sync();
    };

    return {
        clients,
        client,
        modems,
        modem,
        isConnected,
        clear,
        start,
        stop,
    };
};

export const db = useDatabase();
