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
        const projects: Map<string, string> = new Map();
        for (const entry of demoData) {
            const fleet = await clientDb.fleet.add({
                name: entry.name,
                isArchived: 'false',
                description: 'This is demo fleet',
            });
            if (!fleet) throw new Error('Failed to create demo fleet');
            let projectId = projects.get(entry.project);
            if (!projectId) {
                const project = await clientDb.project.add({
                    name: entry.project,
                    isArchived: 'false',
                    description: 'This is demo project',
                });
                if (!project) throw new Error('Failed to create demo project');
                projectId = project.id;
                projects.set(entry.project, projectId);
            }

            const deployment = await clientDb.deployment.add({
                title: `${entry.name} ${entry.startTime.toLocaleDateString()}`,
                isArchived: 'false',
                description: 'This is demo deployment',
                state: 'RUNNING',
                projectId: projectId,
                fleetId: fleet.id,
                createdAt: entry.startTime.toISOString(),
                deploymentData: '{}',
            });
            if (!deployment)
                throw new Error('Failed to create demo deployment');
            await clientDb.projectFleet.add({
                fleetId: fleet.id,
                projectId: projectId,
            });

            if (firstUser)
                await clientDb.userFleet.add({
                    userId: firstUser.id,
                    fleetId: fleet.id,
                });
            for (const record of entry.records) {
                const producerName = capitalizeWords(
                    uniqueNamesGenerator(customConfig).toLocaleLowerCase(),
                );

                await clientDb.producer.add({
                    name: producerName,
                    isArchived: 'false',
                    type: ProducerType.GEORGE,
                    state: record.operation.state,
                    status: record.operation.status,
                    lastSeen: record.operation.lastSeen,
                    activeDeployment: deployment.id,
                    location: { lat: record.lat, lon: record.lon },
                    fleetId: fleet.id,
                    projectId,
                });
            }
        }
    } catch (error) {
        console.error('Error filling database with demo data:', error);
        throw error;
    }
};
