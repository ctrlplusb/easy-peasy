/* eslint-disable */

import { Action, action } from 'easy-peasy';

interface Notification {
  id: string;
  title: string;
  subTitle: string;
}

interface Notifications {
  [key: string]: Notification;
}

export interface NotificationsModel {
  items: Notifications;
  add: Action<NotificationsModel, Notification>;
}

let id = 1;

const notificationsModel: NotificationsModel = {
  items: {},
  add: action((state, payload) => {
    id += 1;
    //     👇 error
    state.items[id.toString()] = payload;
  }),
};

export default notificationsModel;
