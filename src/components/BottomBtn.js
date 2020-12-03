import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './BottomBtn.css'

const BottomBtn = ({ text, colorClass, icon, onClick }) => {
    return (
        <button
            type="button"
            className={`btn btn-block bottom-btn no-border ${colorClass}`}
        >
            <FontAwesomeIcon
                icon={icon}
            />
            <span className="btm-btn-text">{text}</span>
        </button>
    );
};

BottomBtn.propTypes = {
    text: PropTypes.string,
    colorClass: PropTypes.string,
    icon: PropTypes.object.isRequired, // 如果这里不是required，fontAwesome的Icon就无法显示了；element是React元素
    onClick: PropTypes.func,
};
BottomBtn.defaultProps = {
    text: '新建',
};
export default BottomBtn;
