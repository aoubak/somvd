const WIDTHS = { default: 'max-w-5xl', narrow: 'max-w-3xl' };

// Page-width wrapper with the 16 px phone gutter
export default function Container({ as: Tag = 'div', size = 'default', className = '', children, ...props }) {
  return (
    <Tag className={`mx-auto w-full px-4 sm:px-6 ${WIDTHS[size]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
