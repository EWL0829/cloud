import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import useKeyPress from "../hooks/useKeyPress";


FileSearch.propTypes = {
    title: PropTypes.string,
    onFileSearch: PropTypes.func.isRequired,
};

FileSearch.defaultProps = {
    title: '我的云文档'
};

export default function FileSearch({ title, onFileSearch }) {
    const [inputActive, setInputActive] = useState(false);
    const [value, setValue] = useState('');
    const isEnterPressed = useKeyPress(13);
    const isEscPressed = useKeyPress(27);
    let inputEl = useRef(null);

    const closeSearch = () => {
        setInputActive(false);
        setValue('');
        onFileSearch('');
    }
    useEffect(() => {
        if (isEnterPressed && inputActive) {
            onFileSearch(value);
        }

        if (isEscPressed && inputActive) {
            closeSearch();
        }
        // 这里添加isEnterPressed以及isEscPressed的原因是只有在这两个值中有一个变化时才会执行一次这个搜索或者关闭搜索的操作
        // 防止用户一直按住按键导致事件频繁触发
    }, [isEnterPressed, isEscPressed]);

    useEffect(() => {
        if (inputActive) {
            inputEl.current.focus();
        }
    }, [inputActive]);

    return (
        <div className="alert alert-primary file-search-wrap">
            <div className="d-flex flex-search-content justify-content-between align-items-center">
                {
                    !inputActive ?
                        <>
                            <span>{title}</span>
                            <button
                                type="button"
                                className="icon-button"
                                onClick={() => {
                                    setInputActive(true);
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    size="lg"
                                    title="搜索"
                                />
                            </button>
                        </>
                        :
                        <>
                            <input
                                type="text"
                                className="form-control"
                                value={value}
                                ref={inputEl}
                                // autoFocus={true}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    if (value === '' || value === null || value === undefined) {
                                        onFileSearch(value);
                                    }
                                    setValue(value);
                                }}
                            />
                            <button
                                type="button"
                                className="icon-button"
                                onClick={(e) => {
                                    closeSearch(e);
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faTimes}
                                    size="lg"
                                    title="关闭"
                                />
                            </button>
                        </>
                }
            </div>
        </div>
    );
}

