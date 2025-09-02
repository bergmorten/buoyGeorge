import { clientDb } from 'client/services/database';

export const emptyDatabase = async () => {
    try {
        const fleets = clientDb.fleetArray.value;

        for (const fleet of fleets) {
            await clientDb.fleet.remove(fleet.id);
            const fleetUsers = clientDb.getFleetUsers.value(fleet.id);
            for (const fu of fleetUsers) {
                await clientDb.userFleet.remove(fu.id);
            }
            const fleetProjects = clientDb.getFleetProjects.value(fleet.id);
            for (const fp of fleetProjects) {
                await clientDb.projectFleet.remove(fp.id);
            }
            const fleetDeployments = clientDb.getFleetDeployments.value(
                fleet.id,
            );
            for (const fd of fleetDeployments) {
                await clientDb.deployment.remove(fd.id);
            }
        }
        const projects = clientDb.projectArray.value;
        for (const project of projects) {
            await clientDb.project.remove(project.id);
            const projectFleets = clientDb.getProjectFleets.value(project.id);
            for (const pf of projectFleets) {
                await clientDb.projectFleet.remove(pf.id);
            }
            const projectDeployments = clientDb.getProjectDeployments.value(
                project.id,
            );
            for (const pd of projectDeployments) {
                await clientDb.deployment.remove(pd.id);
            }
        }
        const producers = clientDb.producerArray.value;
        for (const producer of producers) {
            await clientDb.producer.remove(producer.id);
        }
    } catch (error) {
        console.error('Error cleaning database for demo data:', error);
    }
};
