import Bugsnag from '@bugsnag/js';

export const startMonitorUser = (id: string) => {
  if (Bugsnag.isStarted()) {
    try {
      Bugsnag.setUser(id);
    } catch (e) {
      if (e instanceof Error) Bugsnag.notify(e);
    }
  }
};
export const stopMonitorUser = () => {
  if (Bugsnag.isStarted()) {
    try {
      Bugsnag.setUser(undefined);
    } catch (e) {
      if (e instanceof Error) Bugsnag.notify(e);
    }
  }
};
