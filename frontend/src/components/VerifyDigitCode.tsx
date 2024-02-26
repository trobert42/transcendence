import { useEffect, useRef, useState } from 'react';

export const VerifyDigitCode = ({ onCodeChange }: any) => {
  const [code, setCode] = useState(new Array(6).fill(''));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleChange = (element: any, index: any) => {
    if (isNaN(element.value)) return false;

    const newCode = [
      ...code.map((d, idx) => (idx === index ? element.value : d)),
    ];
    setCode(newCode);
    onCodeChange(newCode.join(''));

    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (element: any, index: any) => {
    if (element.key === 'Backspace' || element.key === 'Delete') {
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
      onCodeChange(newCode.join(''));

      if (element.target.previousSibling) {
        setTimeout(() => {
          element.target.previousSibling.focus();
        }, 0);
      }
    }
  };

  return (
    <div>
      {code.map((data, index) => {
        return (
          <input
            ref={index === 0 ? inputRef : null}
            className="input-digit"
            type="text"
            name="code"
            key={index}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={(e) => e.target.select()}
          />
        );
      })}
    </div>
  );
};
