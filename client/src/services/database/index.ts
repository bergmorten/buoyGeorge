import { shallowReactive, ref, computed } from 'vue';
import user, { type User } from './users';
import fleet, { type Fleet } from './fleets';
import producer, { type Producer } from './producers';
import deployment, { type Deployment } from './deployments';
import project, { type Project } from './projects';
import userFleet, { type UserFleet } from './userFleet';
import projectFleet, { type ProjectFleet } from './projectFleet';
import org, { organization } from './org';
import { ConnectionState } from 'aws-amplify/data';
import { CONNECTION_STATE_CHANGE } from 'aws-amplify/data';
import { Hub } from 'aws-amplify/utils';
import Bugsnag from '@bugsnag/js';
import { Notify } from 'quasar';
import { type Schema } from 'clientRoot/amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

const useDatabase = () => {
    let client: ReturnType<typeof generateClient<Schema>> | undefined;
    const users = shallowReactive<Map<string, User>>(new Map());
    const fleets = shallowReactive<Map<string, Fleet>>(new Map());
    const producers = shallowReactive<Map<string, Producer>>(new Map());
    const deployments = shallowReactive<Map<string, Deployment>>(new Map());
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
        deployments.clear();
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
            const allDeployments = await deployment.getAll(false);
            allDeployments.forEach((d) => deployments.set(d.id, d));
            const allProjects = await project.getAll(false);
            allProjects.forEach((p) => projects.set(p.id, p));
            const organization = await org.get();
            if (!organization) {
                console.warn('No organization found');
                Notify.create({
                    type: 'negative',
                    message: 'No organization found',
                });
            }
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
        client = generateClient<Schema>({ authMode: 'userPool' });
        user.startSubscriptions(client, users);
        fleet.startSubscriptions(client, fleets);
        userFleet.startSubscriptions(client, userFleets);
        projectFleet.startSubscriptions(client, projectFleets);
        producer.startSubscriptions(client, producers);
        deployment.startSubscriptions(client, deployments);
        project.startSubscriptions(client, projects);
        org.startSubscriptions(client);
        await sync();
        hasStarted = true;
    };

    const stop = () => {
        user.stopSubscriptions();
        fleet.stopSubscriptions();
        userFleet.stopSubscriptions();
        producer.stopSubscriptions();
        deployment.stopSubscriptions();
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

    const getUserFleet = computed(() => {
        return (userId: string) => {
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
    });

    const getFleetUsers = computed(() => {
        return (fleetId: string) => {
            const records = Array.from(userFleets.values()).filter(
                (uf) => uf.fleetId === fleetId,
            );
            const u: User[] = [];
            records.forEach((uf) => {
                const user = users.get(uf.userId);
                if (user) {
                    u.push(user);
                }
            });
            return u;
        };
    });

    const getFleetProjects = computed(() => {
        return (fleetId: string) => {
            const records = Array.from(projectFleets.values()).filter(
                (pf) => pf.fleetId === fleetId,
            );
            const p: Project[] = [];
            records.forEach((pf) => {
                const project = projects.get(pf.projectId);
                if (project) {
                    p.push(project);
                }
            });
            return p;
        };
    });

    const getProjectFleets = computed(() => {
        return (projectId: string) => {
            const records = Array.from(projectFleets.values()).filter(
                (pf) => pf.projectId === projectId,
            );
            const f: Fleet[] = [];
            records.forEach((pf) => {
                const fleet = fleets.get(pf.fleetId);
                if (fleet) {
                    f.push(fleet);
                }
            });
            return f;
        };
    });
    const getFleetDeployments = computed(() => {
        return (fleetId: string) => {
            const records = Array.from(deployments.values()).filter(
                (d) => d.fleetId === fleetId,
            );
            const p: Deployment[] = [];
            records.forEach((d) => {
                const deployment = deployments.get(d.id);
                if (deployment) {
                    p.push(deployment);
                }
            });
            return p;
        };
    });

    const getProjectDeployments = computed(() => {
        return (projectId: string) => {
            const records = Array.from(deployments.values()).filter(
                (d) => d.projectId === projectId,
            );
            const p: Deployment[] = [];
            records.forEach((d) => {
                const deployment = deployments.get(d.id);
                if (deployment) {
                    p.push(deployment);
                }
            });
            return p;
        };
    });

    const usersArray = computed(() => Array.from(users.values()));
    const fleetArray = computed(() => Array.from(fleets.values()));
    const projectArray = computed(() => Array.from(projects.values()));
    const producerArray = computed(() => Array.from(producers.values()));
    const deploymentArray = computed(() => Array.from(deployments.values()));
    const projectFleetArray = computed(() =>
        Array.from(projectFleets.values()),
    );
    return {
        org,
        organization,
        users,
        usersArray,
        fleets,
        fleetArray,
        projects,
        projectArray,
        projectFleets,
        userFleets,
        producers,
        producerArray,
        deployments,
        deploymentArray,
        projectFleetArray,
        user,
        fleet,
        userFleet,
        projectFleet,
        producer,
        deployment,
        project,
        isConnected,
        clear,
        start,
        stop,
        getUserFleet,
        getFleetUsers,
        getFleetProjects,
        getProjectFleets,
        getFleetDeployments,
        getProjectDeployments,
    };
};

export const clientDb = useDatabase();
