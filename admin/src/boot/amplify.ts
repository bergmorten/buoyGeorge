import { Amplify, type ResourcesConfig } from 'aws-amplify';
//import { type ClientExport } from '@hefring/adminAPI/data';
import { LocalStorage } from 'quasar';
import { boot } from 'quasar/wrappers';

export const hasExternalConfig =
    process.env.MODE === 'electron' ||
    process.env.MODE === 'capacitor' ||
    false;

export default boot(async () => {
    console.debug('booting amplify');

    if (process.env.MODE === 'electron' || process.env.MODE === 'capacitor') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prevConfig = LocalStorage.getItem<any>('clientConfig');
        if (prevConfig && prevConfig.awsExport)
            Amplify.configure(prevConfig.awsExport as ResourcesConfig);
        return;
    } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore this will be missing in capacitor and electron
        const awsconfig = await import('adminRoot/amplify_outputs.json');
        Amplify.configure(awsconfig);
    }
});
