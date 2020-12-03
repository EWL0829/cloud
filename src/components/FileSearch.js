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
    });

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
                                    setValue(e.target.value);
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

