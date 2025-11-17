
import React, { useState, useRef, useEffect } from 'react';

interface EditableFieldProps {
  as?: React.ElementType;
  value: string;
  onUpdate: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
  isTextarea?: boolean;
  // Fix: Allow any other props to be passed to the component, such as 'href' for anchor tags.
  [x: string]: any;
}

const EditableField: React.FC<EditableFieldProps> = ({
  as: Component = 'span',
  value,
  onUpdate,
  onBlur,
  className,
  placeholder,
  isTextarea = false,
  ...rest
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  // Fix: Use separate refs for input and textarea to resolve type conflicts.
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update internal state if the external value prop changes
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // Focus the input when editing mode is activated
  useEffect(() => {
    if (isEditing) {
      if (isTextarea && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      } else if (!isTextarea && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, isTextarea]);
  
  const handleBlur = () => {
    setIsEditing(false);
    // Only call update if the value has actually changed
    if (currentValue !== value) {
      onUpdate(currentValue);
    }
    // Trigger any additional onBlur logic (like fetching a logo)
    if (onBlur) {
      onBlur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTextarea && !(e.nativeEvent.isComposing)) {
       e.preventDefault();
       inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setCurrentValue(value); // Revert changes
      setIsEditing(false);
    }
  };

  if (isEditing) {
    const commonProps = {
      value: currentValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCurrentValue(e.target.value),
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      className: `${className} outline-none border border-blue-400 rounded-sm px-1 -my-px bg-white ring-2 ring-blue-200 w-full editable-input-text`,
      placeholder: placeholder,
    };
    
    return isTextarea 
      // Fix: Pass specific ref to textarea
      ? <textarea {...commonProps} ref={textareaRef} rows={Math.max(3, currentValue.split('\n').length)} /> 
      // Fix: Pass specific ref to input
      : <input type="text" {...commonProps} ref={inputRef} />;
  }

  // Display mode
  return (
    <Component
      onClick={() => setIsEditing(true)}
      className={`${className} cursor-pointer hover:bg-blue-50/80 -my-px px-1 rounded-sm transition-colors duration-200 w-full`}
      title="Click to edit"
      dangerouslySetInnerHTML={{ __html: value || `<span class="text-gray-400 italic">${placeholder || ''}</span>`}}
      // Fix: Spread additional props to support attributes like href for anchor tags.
      {...rest}
    />
  );
};

export default EditableField;
