import React from 'react';
import '../utils/styles/style.css';
interface Props {
  text?: string;
  href?: string;
}

export const ButtonAuthFormRed: React.FC<Props> = ({ text }) => {
  return (
    <div className="button-form button-red">
      <div className="text-wrapper">{text}</div>
    </div>
  );
};

export const ButtonAuthFormBlue: React.FC<Props> = ({ text, href }) => {
  return (
    <div className="button-form button-blue">
      {href && (
        <div className="text-wrapper">
          <a style={{ color: 'inherit', textDecoration: 'none' }} href={href}>
            {text}
          </a>
        </div>
      )}
    </div>
  );
};
