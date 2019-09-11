---
order: 12
title:
  zh-CN: 使用hook来配合context
  en-US: Use hook with context
---

## zh-CN

todo

## en-US

todo

```jsx
import { Modal, Button } from 'antd';
import { Link } from 'react-router';

const MyContext = React.createContext();

function App() {
  const [modal, elements] = Modal.useModal();

  function info() {
    modal.info({
      title: 'This is a notification message',
      content: (
        <div>
          <p>
            <MyContext.Consumer>{value => value}</MyContext.Consumer>
          </p>
        </div>
      ),
      onOk() {},
    });
  }

  function success() {
    modal.success({
      title: 'This is a success message',
      content: <Link to="/components/message/">Let's go to message</Link>,
    });
  }

  function error() {
    const { destroy } = modal.error({
      title: 'This is an error message',
      content: (
        <div>
          <Button onClick={() => destroy()}>Close me</Button>
          <Button onClick={() => modal.destroyAll()}>Close all</Button>
        </div>
      ),
    });
  }

  function warning() {
    modal.warning({
      title: 'This is a warning message',
      content: <Button onClick={error}>Error Button</Button>,
    });
  }

  return (
    <MyContext.Provider value="This is value from context!!">
      <div>
        {elements}
        <Button onClick={info}>Info</Button>
        <Button onClick={success}>Success</Button>
        <Button onClick={error}>Error</Button>
        <Button onClick={warning}>Warning</Button>
      </div>
    </MyContext.Provider>
  );
}

ReactDOM.render(<App />, mountNode);
```
