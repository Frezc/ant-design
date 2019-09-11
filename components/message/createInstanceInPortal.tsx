import * as React from 'react';
import Portal from 'rc-util/lib/Portal';
import Notification, { INotificationProps, INotification } from 'rc-notification';
import warning from '../_util/warning';

export interface NotificationInstance extends INotification {
  element: React.ReactElement;
}

export function createInstanceInPortal(
  properties: INotificationProps & { componentName: string },
): NotificationInstance {
  const { getContainer, componentName, ...props } = properties || ({} as any);
  const instanceRef = React.createRef<Notification>();

  const element = (
    <Portal
      getContainer={() => {
        const div = document.createElement('div');
        if (getContainer) {
          const root = getContainer();
          root.appendChild(div);
        } else {
          document.body.appendChild(div);
        }
        return div;
      }}
    >
      <Notification {...props} ref={instanceRef} />
    </Portal>
  );

  return {
    notice(noticeProps: any) {
      if (!instanceRef.current) {
        return showWarn(componentName);
      }
      instanceRef.current.add(noticeProps);
    },
    removeNotice(key: React.Key) {
      if (!instanceRef.current) {
        return showWarn(componentName);
      }
      instanceRef.current.remove(key);
    },
    element,
    destroy() {
      ReactDOM.unmountComponentAtNode(div);
      div.parentNode.removeChild(div);
    },
  };
}

function showWarn(componentName: string) {
  warning(
    false,
    componentName,
    `Portal element is not mounted, make sure you have put it in your render elements. Check document for detail.`,
  );
}
