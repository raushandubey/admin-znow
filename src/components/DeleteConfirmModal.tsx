import React from 'react';

interface DeleteConfirmModalProps {
  title: string;
  message: string;
  onCancel: () => void;
  onDelete: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ title, message, onCancel, onDelete }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
};
