import React from "react";

interface SimpleToggleSwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const SimpleToggleSwitchGlobal: React.FC<SimpleToggleSwitchProps> = ({
  checked,
  defaultChecked,
  onChange,
  className = "",
  disabled = false,
}) => {
  const [internalChecked, setInternalChecked] = React.useState<boolean>(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const actualChecked = isControlled ? checked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    const newChecked = !actualChecked;

    if (!isControlled) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked);
  };

  return (
    <label
      className={`inline-flex items-center cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#6C47B7] via-[#5A3693] to-[#341F60]">
        <div className="relative bg-white dark:bg-black rounded-full w-10 h-6">
          <input
            type="checkbox"
            className="sr-only"
            checked={actualChecked}
            onChange={handleToggle}
            disabled={disabled}
          />
          <div
            className={`block w-10 h-6 rounded-full ${
              actualChecked ? "bggradient" : "bg-white"
            } transition duration-300`}
          ></div>
          <div
            className={`absolute left-1 top-1 w-4 h-4 rounded-full transition transform ${
              actualChecked
                ? "bg-white translate-x-4"
                : "bg-gradient-to-tr from-[#6C47B7] via-[#5A3693] to-[#341F60]"
            }`}
          ></div>
        </div>
      </div>
    </label>
  );
};

export default SimpleToggleSwitchGlobal;
