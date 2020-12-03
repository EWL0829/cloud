import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import './TabList.scss';

TabList.propTypes = {
    files: PropTypes.array,
    activeId: PropTypes.number,
    unsavedIds: PropTypes.array,
    onTabClick: PropTypes.func,
    onCloseTab: PropTypes.func
};

TabList.defaultProps = {
    unsavedIds: []
};
export default function TabList({ files, activeId, unsavedIds, onTabClick, onCloseTab }) {

    return (
        <ul className="nav nav-pills tablist-component">
            {
                files.map(file => {
                    const { id } = file;
                    const withUnsavedMark = unsavedIds.includes(id);
                    const fClassName = classNames('nav-link', {
                        active: id === activeId,
                        withUnsaved: withUnsavedMark,
                    });
                    return (
                        <li className="nav-item"
                            key={id}
                        >
                            <a href="#"
                               className={fClassName}
                               onClick={(e) => {
                                   e.preventDefault();
                                   onTabClick(id);
                               }}
                            >
                                {file.title}
                                <span
                                   className="ml-2 close-icon"
                                   onClick={(e) => {
                                       // e.preventDefault();
                                       e.stopPropagation();
                                       onCloseTab(id);
                                   }}
                                >
                                   <FontAwesomeIcon icon={faTimes}/>
                                </span>
                                {
                                    withUnsavedMark && <span className="ml-2 rounded-circle unsaved-icon" />
                                }
                            </a>
                        </li>
                    );
                })
            }
        </ul>
    );
}

