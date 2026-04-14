type RefreshSubscriber = (token: string) => void;

let isRefreshing = false;
let subscribers: RefreshSubscriber[] = [];

export const refreshController = {
    isRefreshing: () => isRefreshing,

    start() {
        isRefreshing = true;
    },

    finish() {
        isRefreshing = false;
    },

    subscribe(cb: RefreshSubscriber) {
        subscribers.push(cb);
    },

    notify(token: string) {
        subscribers.forEach((cb) => cb(token));
        subscribers = [];
    },
};