import * as React from 'react';
import Notification, { INotification } from 'rc-notification';
import Icon from '../icon';
import { NotificationInstance, createInstanceInPortal } from './createInstanceInPortal';

let defaultDuration = 3;
let defaultTop: number;
let messageInstance: any;
let key = 1;
let prefixCls = 'ant-message';
let transitionName = 'move-up';
let getContainer: () => HTMLElement;
let maxCount: number;

function getMessageInstance(callback: (i: INotification) => void) {
  if (messageInstance) {
    callback(messageInstance);
    return;
  }
  Notification.newInstance(
    {
      prefixCls,
      transitionName,
      style: { top: defaultTop }, // 覆盖原来的样式
      getContainer,
      maxCount,
    },
    (instance: any) => {
      if (messageInstance) {
        callback(messageInstance);
        return;
      }
      messageInstance = instance;
      callback(instance);
    },
  );
}

type NoticeType = 'info' | 'success' | 'error' | 'warning' | 'loading';

export interface ThenableArgument {
  (val: any): void;
}

export interface MessageType {
  (): void;
  then: (fill: ThenableArgument, reject: ThenableArgument) => Promise<void>;
  promise: Promise<void>;
}

export interface ArgsProps {
  content: React.ReactNode;
  duration?: number;
  type: NoticeType;
  onClose?: () => void;
  icon?: React.ReactNode;
}

function notice(
  getInstance: (callback: (instance: INotification) => void) => void,
  args: ArgsProps,
): MessageType {
  const duration = args.duration !== undefined ? args.duration : defaultDuration;
  const iconType = {
    info: 'info-circle',
    success: 'check-circle',
    error: 'close-circle',
    warning: 'exclamation-circle',
    loading: 'loading',
  }[args.type];

  const target = key++;
  const closePromise = new Promise(resolve => {
    const callback = () => {
      if (typeof args.onClose === 'function') {
        args.onClose();
      }
      return resolve(true);
    };
    getInstance(instance => {
      const iconNode = (
        <Icon type={iconType} theme={iconType === 'loading' ? 'outlined' : 'filled'} />
      );
      const switchIconNode = iconType ? iconNode : '';
      instance.notice({
        key: target,
        duration,
        style: {},
        content: (
          <div
            className={`${prefixCls}-custom-content${
              args.type ? ` ${prefixCls}-${args.type}` : ''
            }`}
          >
            {args.icon ? args.icon : switchIconNode}
            <span>{args.content}</span>
          </div>
        ),
        onClose: callback,
      });
    });
  });
  const result: any = () => {
    if (messageInstance) {
      messageInstance.removeNotice(target);
    }
  };
  result.then = (filled: ThenableArgument, rejected: ThenableArgument) =>
    closePromise.then(filled, rejected);
  result.promise = closePromise;
  return result;
}

type ConfigContent = React.ReactNode | string;
type ConfigDuration = number | (() => void);
export type ConfigOnClose = () => void;

export interface ConfigOptions {
  top?: number;
  duration?: number;
  prefixCls?: string;
  getContainer?: () => HTMLElement;
  transitionName?: string;
  maxCount?: number;
}

const api: any = {
  open: (args: ArgsProps) => notice(getMessageInstance, args),
  config(options: ConfigOptions) {
    if (options.top !== undefined) {
      defaultTop = options.top;
      messageInstance = null; // delete messageInstance for new defaultTop
      msgInstanceInHook = null;
    }
    if (options.duration !== undefined) {
      defaultDuration = options.duration;
    }
    if (options.prefixCls !== undefined) {
      prefixCls = options.prefixCls;
    }
    if (options.getContainer !== undefined) {
      getContainer = options.getContainer;
    }
    if (options.transitionName !== undefined) {
      transitionName = options.transitionName;
      messageInstance = null; // delete messageInstance for new transitionName
      msgInstanceInHook = null;
    }
    if (options.maxCount !== undefined) {
      maxCount = options.maxCount;
      messageInstance = null;
      msgInstanceInHook = null;
    }
  },
  destroy() {
    if (messageInstance) {
      messageInstance.destroy();
      messageInstance = null;
    }

    if (msgInstanceInHook) {
    }
  },
};

['success', 'info', 'warning', 'error', 'loading'].forEach(type => {
  api[type] = (content: ConfigContent, duration?: ConfigDuration, onClose?: ConfigOnClose) => {
    if (typeof duration === 'function') {
      onClose = duration;
      duration = undefined;
    }
    return api.open({ content, duration, type, onClose });
  };
});

api.warn = api.warning;

export interface MessageApi {
  info(content: ConfigContent, duration?: ConfigDuration, onClose?: ConfigOnClose): MessageType;
  success(content: ConfigContent, duration?: ConfigDuration, onClose?: ConfigOnClose): MessageType;
  error(content: ConfigContent, duration?: ConfigDuration, onClose?: ConfigOnClose): MessageType;
  warn(content: ConfigContent, duration?: ConfigDuration, onClose?: ConfigOnClose): MessageType;
  warning(content: ConfigContent, duration?: ConfigDuration, onClose?: ConfigOnClose): MessageType;
  loading(content: ConfigContent, duration?: ConfigDuration, onClose?: ConfigOnClose): MessageType;
  open(args: ArgsProps): MessageType;
  config(options: ConfigOptions): void;
  destroy(): void;
}

// use same instance in every hook
let msgInstanceInHook: NotificationInstance | null;

export function useMessage() {
  if (!msgInstanceInHook) {
    msgInstanceInHook = createInstanceInPortal({
      prefixCls,
      transitionName,
      style: { top: defaultTop }, // 覆盖原来的样式
      getContainer,
      maxCount,
      componentName: 'useMessage',
    });
  }

  const hookApi: any = {
    open: (args: ArgsProps) => notice(cb => cb(msgInstanceInHook!), args),
    destroy() {
      if (messageInstance) {
        messageInstance.destroy();
        messageInstance = null;
      }
    },
  };

  ['success', 'info', 'warning', 'error', 'loading'].forEach(type => {
    api[type] = (content: ConfigContent, duration?: ConfigDuration, onClose?: ConfigOnClose) => {
      if (typeof duration === 'function') {
        onClose = duration;
        duration = undefined;
      }
      return api.open({ content, duration, type, onClose });
    };
  });

  return [];
}

export default api as MessageApi;
