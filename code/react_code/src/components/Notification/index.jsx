
import {notification } from 'antd';

//着重显示的消息
const openNotification = (message, description, placement) => {
    notification.success({
      message: message,
      description:description,
      placement,
      duration: 30
    });
  };

export default openNotification;
