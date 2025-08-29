import { shallowReactive, ref } from 'vue';
import user, { type User } from './users';
import fleet, { type Fleet } from './fleets';
import producer, { type Producer } from './producers';
import project, { type Project } from './projects';
import userFleet, { type UserFleet } from './userFleet';
import projectFleet, { type ProjectFleet } from './projectFleet';
import org, { organization } from './org';
import { ConnectionState } from 'aws-amplify/data';
import { CONNECTION_STATE_CHANGE } from 'aws-amplify/data';
import { Hub } from 'aws-amplify/utils';
import Bugsnag from '@bugsnag/js';
import { Notify } from 'quasar';

const useDatabase = () => {
    const users = shallowReactive<Map<string, User>>(new Map());
    const fleets = shallowReactive<Map<string, Fleet>>(new Map());
    const producers = shallowReactive<Map<string, Producer>>(new Map());
    const projects = shallowReactive<Map<string, Project>>(new Map());
    const userFleets = shallowReactive<Map<string, UserFleet>>(new Map());
    const projectFleets = shallowReactive<Map<string, ProjectFleet>>(new Map());
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
        users.clear();
        fleets.clear();
        userFleets.clear();
        projectFleets.clear();
        producers.clear();
        projects.clear();
    };

    const sync = async () => {
        try {
            clear();
            const allUsers = await user.getAll(false);
            allUsers.forEach((u) => users.set(u.id, u));
            const allFleets = await fleet.getAll(false);
            allFleets.forEach((f) => fleets.set(f.id, f));
            const allUserFleets = await userFleet.getAll();
            allUserFleets.forEach((uf) => userFleets.set(uf.id, uf));
            const allProjectFleets = await projectFleet.getAll();
            allProjectFleets.forEach((pf) => projectFleets.set(pf.id, pf));
            const allProducers = await producer.getAll(false);
            allProducers.forEach((p) => producers.set(p.id, p));
            const allProjects = await project.getAll(false);
            allProjects.forEach((p) => projects.set(p.id, p));
            await org.get();
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
        user.startSubscriptions(users);
        fleet.startSubscriptions(fleets);
        userFleet.startSubscriptions(userFleets);
        projectFleet.startSubscriptions(projectFleets);
        producer.startSubscriptions(producers);
        project.startSubscriptions(projects);
        org.startSubscriptions();
        await sync();
        hasStarted = true;
    };

    const stop = () => {
        user.stopSubscriptions();
        fleet.stopSubscriptions();
        userFleet.stopSubscriptions();
        producer.stopSubscriptions();
        project.stopSubscriptions();
        projectFleet.stopSubscriptions();
        org.stopSubscriptions();
        hasStarted = false;
    };

    const syncSubscriptions = async () => {
        // In amplify gen 1 we had _deleted which we could use to identify deleted users and then sync from last connected time
        clear();
        await sync();
    };

    const getUserFleet = (userId: string) => {
        const records = Array.from(userFleets.values()).filter(
            (uf) => uf.userId === userId,
        );
        const f: Fleet[] = [];
        records.forEach((uf) => {
            const fleet = fleets.get(uf.fleetId);
            if (fleet) {
                f.push(fleet);
            }
        });
        return f;
    };

    return {
        org,
        organization,
        users,
        fleets,
        projects,
        projectFleets,
        userFleets,
        producers,
        user,
        fleet,
        userFleet,
        projectFleet,
        producer,
        project,
        isConnected,
        clear,
        start,
        stop,
        getUserFleet,
    };
};

export const db = useDatabase();
