import React from 'react';
import '../utils/styles/style.css';

interface Props {
  placeHolder: string;
}

export const InputAuthForm: React.FC<Props> = ({ placeHolder }) => {
  return (
    <div className="input-auth-form">
      <div className="text-wrapper">{placeHolder}</div>
    </div>
  );
};
