# Mesg 

[![Join the chat at https://gitter.im/zanjs/mesg.js](https://badges.gitter.im/zanjs/mesg.js.svg)](https://gitter.im/zanjs/mesg.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

桌面消息通知中间件


```
npm install mesg --save
```

## Use



```javascript
import Mesg from 'mesg';
```

```javascript
Mesg.create('Hello Mesg!')
```

只是一个通用的API，没有构造函数，您可以从任何地方调用访问,与AMD兼容.

```javascript
define(['pushjs'], function (Mesg) {
   Mesg.create('Hello Mesg!');
});
```

如果浏览器没有权限发送推送通知，Mesg 会立即自动创建申请许可

#### 关闭通知
 
- 直接设置超时时间
- tag属性 调用 `Mesg.close(foo)` 方法

```javascript
Mesg.create('Hello Mesg!', {
    tag: 'foo'
});

// 需要关闭时...

Mesg.close('foo');
```

也可以 分配一个变量 给 Mesg  然后调用 变量 `close()` 方法

```javascript
var notification = Mesg.create('Hello World!');

// 需要关闭时....

notification.close();
```

清除所有打开的通知

```javascript
Mesg.clear();
```

### 选项 

在消息调用唯一需要的参数是一个标题,
但是，这并不意味着你不能加一点额外的事情。
您可以在选项消息传递更多内容，就像这样：

```javascript
Mesg.create('Hello World!', {
    body: 'This is some body content!',
    icon: {
        x16: 'images/icon-x16.png',
        x32: 'images/icon-x32.png'
    },
    timeout: 5000
});
```

#### 可用选项 

* __body__: 通知的正文。
* __icon__: 可以是URL以图标图像或包含16×16和32×32像素的图标图像的阵列（见上文）.
* __onClick__: 单击该通知时回调执行。
* __onClose__: 当通知被关闭回调执行（过时）.
* __onError__: 回调如果通知抛出一个错误.
* __onShow__: 当显示的通知回调执行（过时）.
* __tag__: 唯一的标签用于标识的通知。可用于稍后手动关闭通知.
* __timeout__: 以毫秒为单位，直到通知的时间自动关闭。

