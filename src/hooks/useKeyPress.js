import React, { useEffect, useState } from 'react';

export default function useKeyPress(targetKeyCode) {
    const [ keyPressed, setKeyPressed ] = useState(false);

    // 按下按键
    const keyDownHandler = ({ keyCode }) => {
        if (keyCode === targetKeyCode) {
            setKeyPressed(true);
        }
    };
    // 松开按键
    const keyUpHandler = ({ keyCode }) => {
        if (keyCode === targetKeyCode) {
            setKeyPressed(false);
        }
    };

    useEffect(() => {
        document.addEventListener('keyup', keyUpHandler);
        document.addEventListener('keydown', keyDownHandler);

        return () => {
            document.removeEventListener('keyup', keyUpHandler);
            document.removeEventListener('keydown', keyDownHandler);
        };
    }, []);
    // 这里传递一个空数组的原因在于这个事件的绑定和解绑只需要分别在加载和卸载的时候执行就可以，如果不加会在组件渲染的时候一遍又一遍的绑定卸载，没有这个必要

    return keyPressed;
}

