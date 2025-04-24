import React from 'react';
export const Box = ({ children, margin }) => (<div style={{ margin: margin || '0' }}>
    {children}
  </div>);
export const Card = ({ children, padding, marginBottom }) => (<div style={{
        padding: padding || '1rem',
        marginBottom: marginBottom || '1rem',
        border: '1px solid var(--border-color, #ccc)',
        borderRadius: '4px',
        backgroundColor: 'var(--card-bg, #fff)'
    }}>
    {children}
  </div>);
export const Checkbox = ({ children, checked }) => (<label style={{ display: 'flex', alignItems: 'center' }}>
    <input type="checkbox" checked={checked} readOnly style={{ marginRight: '0.5rem' }}/>
    {children}
  </label>);
export const Text = ({ children, variant = 'body', marginBottom }) => {
    const style = variant === 'headline' ? {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'var(--text-primary, #000)',
        marginBottom: marginBottom || '0'
    } : {
        fontSize: '1rem',
        color: 'var(--text-secondary, #333)',
        marginBottom: marginBottom || '0'
    };
    return <div style={style}>{children}</div>;
};
