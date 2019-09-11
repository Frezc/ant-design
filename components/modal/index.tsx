import * as React from 'react';
import Modal, { ModalFuncProps, destroyFns } from './Modal';
import confirm from './confirm';
import Icon from '../icon';
import useModal from './useModal';

export { ActionButtonProps } from './ActionButton';

function modalWarn(props: ModalFuncProps) {
  const config = {
    type: 'warning',
    icon: <Icon type="exclamation-circle" />,
    okCancel: false,
    ...props,
  };
  return confirm(config);
}

Modal.info = function(props: ModalFuncProps) {
  const config = {
    type: 'info',
    icon: <Icon type="info-circle" />,
    okCancel: false,
    ...props,
  };
  return confirm(config);
};

Modal.success = function(props: ModalFuncProps) {
  const config = {
    type: 'success',
    icon: <Icon type="check-circle" />,
    okCancel: false,
    ...props,
  };
  return confirm(config);
};

Modal.error = function(props: ModalFuncProps) {
  const config = {
    type: 'error',
    icon: <Icon type="close-circle" />,
    okCancel: false,
    ...props,
  };
  return confirm(config);
};

Modal.warning = modalWarn;

Modal.warn = modalWarn;

Modal.confirm = function(props: ModalFuncProps) {
  const config = {
    type: 'confirm',
    okCancel: true,
    ...props,
  };
  return confirm(config);
};

Modal.destroyAll = function() {
  while (destroyFns.length) {
    const close = destroyFns.pop();
    if (close) {
      close();
    }
  }
};

Modal.useModal = useModal;

export default Modal;
