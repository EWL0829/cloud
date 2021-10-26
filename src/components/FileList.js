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
    const closeSearch = (curEditItem) => {
        setCurEditId(false);
        setValue('');

        // 如果当前编辑的file是新增的file，当按下esc的时候直接删除该新增文件
        if (curEditItem.isNew) {
            onFileDelete(curEditItem.id);
        }
    };

    // 点击新建的时候需要更新当前正在编辑的文件id为新文件的id并且需要判断file的isNew属性值
    // once files change, make the new added file current-change status;
    useEffect(() => {
        const newFile = files.find(file => file.isNew);

        if (newFile) {
            setCurEditId(newFile.id);
        }
    }, [files]);

    useEffect(() => {
        const curEditItem = files.find(item => item.id === curEditId);

        // 添加trim的原因在于空值不允许保存
        if (isEnterPressed && curEditId && value.trim() !== '') {
            onSaveEdit(curEditItem.id, value, curEditItem.isNew);
            setCurEditId(''); // 将当前修改项改回默认值，离开编辑状态
            setValue(''); // 将输入框内的内容改为空值
        }

        if (isEscPressed && curEditId) {
            closeSearch(curEditItem);
        }
        // deps里面如果没有传入依赖的话就会有warning
    }, [isEnterPressed, curEditId, isEscPressed, files, onSaveEdit, value]);

    return (
        <ul className="list-group list-group-flush file-list-wrap">
            {
                files.map(file => {
                    const { id, title, isNew } = file;
                    return (
                        <li
                            className="list-group-item mx-0 row bg-light d-flex flex-nowrap align-items-center file-list-item"
                            key={id}
                        >
                            {
                                (curEditId !== id && !isNew) && <>
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
                                </>
                            }
                            {
                                // 命中当前编辑的id或者是新创建的file
                                (curEditId === id || isNew) &&
                                <>
                                    <input
                                        type="text"
                                        className="form-control col-10"
                                        value={value}
                                        autoFocus={true}
                                        placeholder={isNew && '请输入标题'}
                                        onChange={(e) => {
                                            setValue(e.target.value);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="icon-button col-2"
                                        onClick={() => {
                                            closeSearch(file);
                                        }}
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

