import React from "react";
import './index.scss'

export default function VecModal({visible, title, onOk, onCancel, children}) {
    const handleCancel = () => onCancel && onCancel()

    const handleOk = () => onOk && onOk()

    return <div className={`v-modal-wrapper ${visible ? '' : 'hide'}`}>
        <div className="v-modal-mask" onClick={handleCancel}></div>
        <div className="v-modal-content">
            {
                title && <div className="v-modal-title">
                    <span>{title}</span>
                    <span className="icon-close-modal"></span>
                </div>
            }
            <div className="v-modal-body">{children}</div>
            <div className="v-modal-footer">
                <span className="cancel" onClick={handleCancel}>取消</span>
                <span className="ok" onClick={handleOk}>确定</span>
            </div>
        </div>
    </div>
}