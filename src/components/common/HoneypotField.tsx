import React from 'react';

/**
 * HoneypotField is a security component designed to catch automated bots.
 * It renders an input field that is invisible to human users but visible to bots.
 * If this field is filled, the request should be rejected on the server side.
 */
interface HoneypotFieldProps {
  name?: string;
}

const HoneypotField: React.FC<HoneypotFieldProps> = ({ name = 'hp_field_check' }) => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        height: '0',
        width: '0',
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0,
        zIndex: -1,
      }}
    >
      <label htmlFor={name}>Leave this field empty</label>
      <input
        id={name}
        name={name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
};

export default HoneypotField;
