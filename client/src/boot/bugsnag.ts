import { Platform } from 'quasar';
import { VueRouterRoutingProvider } from '@bugsnag/vue-router-performance';
import { boot } from 'quasar/wrappers';
import Bugsnag from '@bugsnag/js';
import BugsnagPerformance from '@bugsnag/browser-performance';
import BugsnagPluginVue from '@bugsnag/plugin-vue';
import packageInfo from '../../package.json';

const logsLevels = ['warn', 'error'];
export default boot(({ app, router }) => {
    if (!process.env.BUGSNAG_API_KEY) return;
    Bugsnag.start({
        appVersion: packageInfo.version,
        appType: Platform.is.electron
            ? 'electron'
            : Platform.is.capacitor
              ? 'capacitor'
              : 'browser',
        apiKey: process.env.BUGSNAG_API_KEY,
        plugins: [new BugsnagPluginVue()],
        releaseStage: process.env.PRODUCTION ? 'production' : 'development',

        //enabledBreadcrumbTypes: ['error', 'log', 'navigation', 'request', 'user'],
        onBreadcrumb: function (breadcrumb) {
            if (
                breadcrumb.type === 'log' &&
                !logsLevels.includes(breadcrumb.metadata.severity)
            ) {
                return false;
            }
            breadcrumb.metadata.environment = {
                name: process.env.AWS_USER_BRANCH
                    ? process.env.AWS_USER_BRANCH
                    : undefined,
                hostname: window.location.hostname,
            };
        },
        onError: function (event) {
            if (event.errors[0]?.type === 'ChunkLoadError') return false;

            event.addMetadata('environment', {
                name: process.env.AWS_USER_BRANCH
                    ? process.env.AWS_USER_BRANCH
                    : 'Unknown',
                hostname: window.location.hostname,
            });
        },
    });
    BugsnagPerformance.start({
        apiKey: process.env.BUGSNAG_API_KEY,
        routingProvider: new VueRouterRoutingProvider(router),
    });
    const bugsnagVue = Bugsnag.getPlugin('vue');

    if (bugsnagVue === undefined)
        throw new Error('Could not initialize Bug snag');

    // Set i18n instance on app
    app.use(bugsnagVue);
});
