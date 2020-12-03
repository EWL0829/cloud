import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faMarkdown } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';
import useKeyPress from "../hooks/useKeyPress";


FileList.propTypes = {
    files: PropTypes.array,
    onFileClick: PropTypes.func,
    onSaveEdit: PropTypes.func,
    onFileDelete: PropTypes.func,
};

export default function FileList({ files, onFileClick, onSaveEdit, onFileDelete }) {
    const [ curEditId, setCurEditId ] = useState(''); // 当前正在编辑的file id
    const [ value, setValue ] = useState(''); // 当前正在编辑的列表项标题
    const isEnterPressed = useKeyPress(13);
    const isEscPressed = useKeyPress(27);
    const closeSearch = () => {
        setCurEditId(false);
        setValue('');
    };

    useEffect(() => {
        if (isEnterPressed && curEditId) {
            const curEditItem = files.find(item => item.id === curEditId);
            onSaveEdit(curEditItem.id, value);
            setCurEditId(''); // 将当前修改项改回默认值，离开编辑状态
        }

        if (isEscPressed && curEditId) {
            closeSearch();
        }
        // deps里面如果没有传入依赖的话就会有warning
    }, [isEnterPressed, curEditId, isEscPressed, files, onSaveEdit, value]);
    return (
        <ul className="list-group list-group-flush file-list-wrap">
            {
                files.map(file => {
                    const { id, title } = file;
                    console.log('id', id, files); // eslint-disable-line
                    return (
                        <li
                            className="list-group-item mx-0 row bg-light d-flex flex-nowrap align-items-center file-list-item"
                            key={id}
                        >
                            {
                                curEditId !== id ? <>
                                    <span className="col-2">
                                <FontAwesomeIcon
                                    icon={faMarkdown}
                                />
                            </span>
                                    <span
                                        className="col-8 c-link"
                                        onClick={() => { onFileClick(id) }}
                                    >{title}</span>
                                    <button
                                        type="button"
                                        className="edit-button col-1"
                                        onClick={() => {
                                            setCurEditId(id);
                                            setValue(title);
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faEdit}
                                            title="编辑"
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        className="edit-button col-1"
                                        onClick={() => { onFileDelete(id) }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            title="删除"
                                        />
                                    </button>
                                </> : <>
                                    <input
                                        type="text"
                                        className="form-control col-10"
                                        value={value}
                                        // autoFocus={true}
                                        onChange={(e) => {
                                            setValue(e.target.value);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="icon-button col-2"
                                        onClick={closeSearch}
                                    >
                                        <FontAwesomeIcon
                                            icon={faTimes}
                                            title="关闭"
                                        />
                                    </button>
                                </>
                            }
                        </li>
                    );
                })
            }
        </ul>
    );
}

