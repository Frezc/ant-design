import Portal from 'rc-util/lib/Portal';
import { ConfirmDialog, ConfirmDialogProps } from './confirm';
import * as React from 'react';
import { ModalFuncProps } from './Modal';
import Icon from '../icon';

let counter = 0;

type Config = ConfirmDialogProps & { key: number };
type Action =
  | { type: 'destroy'; payload: number }
  | { type: 'update'; payload: Config }
  | { type: 'new'; payload: Config }
  | { type: 'destroyAll' };

export default function useModal() {
  function reducer(state: Config[], action: Action) {
    switch (action.type) {
      case 'new':
        return state.concat([action.payload]);
      case 'destroy':
        return state.filter(({ key }) => key !== action.payload);
      case 'destroyAll':
        return [];
      case 'update':
        return state.map(s => {
          if (s.key === action.payload.key) {
            return Object.assign({}, s, action.payload);
          }
          return s;
        });
      default:
        return state;
    }
  }
  const [configList, dispatch] = React.useReducer(reducer, []);
  const elements = React.useMemo(() => {
    return configList.map(({ key, ...props }) => (
      <Portal
        key={key}
        getContainer={() => {
          const div = document.createElement('div');
          document.body.appendChild(div);
          return div;
        }}
      >
        <ConfirmDialog {...props} />
      </Portal>
    ));
  }, [configList]);

  function internalConfirm(config: ModalFuncProps) {
    let currentConfig: Config = {
      ...config,
      close,
      visible: true,
      key: ++counter,
    };
    dispatch({ type: 'new', payload: currentConfig });

    function close(...args: any[]) {
      currentConfig = {
        ...currentConfig,
        visible: false,
        afterClose: destroy.bind(this, ...args),
      };
      dispatch({ type: 'update', payload: currentConfig });
    }

    function update(newConfig: ModalFuncProps) {
      currentConfig = {
        ...currentConfig,
        ...newConfig,
      };
      dispatch({ type: 'update', payload: currentConfig });
    }

    function destroy(...args: any[]) {
      const triggerCancel = args.some(param => param && param.triggerCancel);
      if (config.onCancel && triggerCancel) {
        config.onCancel(...args);
      }
      dispatch({ type: 'destroy', payload: currentConfig.key });
    }

    return {
      destroy: close,
      update,
    };
  }

  function destroyAll() {
    dispatch({ type: 'destroyAll' });
  }

  function info(props: ModalFuncProps) {
    const config = {
      type: 'info',
      icon: <Icon type="info-circle" />,
      okCancel: false,
      ...props,
    };
    return internalConfirm(config);
  }

  function success(props: ModalFuncProps) {
    const config = {
      type: 'success',
      icon: <Icon type="check-circle" />,
      okCancel: false,
      ...props,
    };
    return internalConfirm(config);
  }

  function error(props: ModalFuncProps) {
    const config = {
      type: 'error',
      icon: <Icon type="close-circle" />,
      okCancel: false,
      ...props,
    };
    return internalConfirm(config);
  }

  function warning(props: ModalFuncProps) {
    const config = {
      type: 'warning',
      icon: <Icon type="exclamation-circle" />,
      okCancel: false,
      ...props,
    };
    return internalConfirm(config);
  }
  const warn = warning;

  function confirm(props: ModalFuncProps) {
    const config = {
      type: 'confirm',
      okCancel: true,
      ...props,
    };
    return internalConfirm(config);
  }

  return [{ confirm, info, success, error, warning, warn, destroyAll }, elements] as const;
}
