import { clientDb } from 'client/services/database';

import { ProducerType } from 'client/services/database/producers';
import { type DemoDataType } from './demoData';
import type { Config } from 'unique-names-generator';
import {
    uniqueNamesGenerator,
    adjectives,
    names,
} from 'unique-names-generator';

const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const fillDatabaseWithDemoData = async (demoData: DemoDataType) => {
    const customConfig: Config = {
        dictionaries: [adjectives, names],
        separator: ' ',
        length: 2,
    };
    try {
        const firstUser = clientDb.usersArray.value[0];
        for (const entry of demoData) {
            const fleet = await clientDb.fleet.add({
                name: entry.name,
                isArchived: 'false',
                description: 'This is demo fleet',
            });
            if (!fleet) throw new Error('Failed to create demo fleet');
            const project = await clientDb.project.add({
                name: `${entry.name} Project`,
                isArchived: 'false',
                description: 'This is demo project',
            });
            if (!project) throw new Error('Failed to create demo project');
            const deployment = await clientDb.deployment.add({
                title: `${entry.name} ${entry.startTime.toLocaleDateString()}`,
                isArchived: 'false',
                description: 'This is demo deployment',
                projectId: project.id,
                fleetId: fleet.id,
                createdAt: entry.startTime.toISOString(),
                deploymentData: '{}',
            });
            if (!deployment)
                throw new Error('Failed to create demo deployment');
            await clientDb.projectFleet.add({
                fleetId: fleet.id,
                projectId: project.id,
            });

            if (firstUser)
                await clientDb.userFleet.add({
                    userId: firstUser.id,
                    fleetId: fleet.id,
                });
            for (const pos of entry.positions) {
                const producerName = capitalizeWords(
                    uniqueNamesGenerator(customConfig).toLocaleLowerCase(),
                );

                await clientDb.producer.add({
                    name: producerName,
                    isArchived: 'false',
                    type: ProducerType.GEORGE,
                    state: pos.operation.state,
                    status: pos.operation.status,
                    lastSeen: pos.operation.lastSeen,
                    activeDeployment: deployment.id,
                    location: pos,
                    fleetId: fleet.id,
                });
            }
        }
    } catch (error) {
        console.error('Error filling database with demo data:', error);
    }
};
