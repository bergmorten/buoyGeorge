import type { QVueGlobals } from 'quasar';
import Bugsnag from '@bugsnag/js';
const customLogger = () => {
  const log = (
    $q: QVueGlobals,
    message: string,
    detailed?: string | Error | unknown,
  ) => {
    if ($q)
      $q.notify({
        type: 'positive',
        timeout: 2500,
        message,
      });
    if (detailed || !$q) {
      console.log(detailed);
    }
  };
  const warn = (
    $q: QVueGlobals,
    message: string,
    detailed?: string | Error | unknown,
  ) => {
    if ($q)
      $q.notify({
        type: 'warning',
        timeout: 2500,
        message,
      });
    if (detailed || !$q) {
      console.warn(detailed);
      if (detailed instanceof Error && Bugsnag.isStarted())
        Bugsnag.notify(detailed);
    }
  };
  const error = (
    $q: QVueGlobals,
    message: string,
    detailed?: string | Error | unknown,
  ) => {
    if ($q)
      $q.notify({
        type: 'negative',
        timeout: 2500,
        message,
      });
    if (detailed || !$q) {
      console.error(detailed);
      if (detailed instanceof Error && Bugsnag.isStarted())
        Bugsnag.notify(detailed);
    }
  };
  return { log, warn, error };
};
export const logger = customLogger();
