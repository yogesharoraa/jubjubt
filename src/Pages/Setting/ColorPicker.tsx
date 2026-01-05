import React from 'react';
import { Color, ColorObject, ColorCombination, Theme } from './ColorPicker';
export type ColorPickerProps = {
    theme?: Partial<Theme>;
    color?: Color;
    presets?: Color[];
    onChange?: (color: ColorObject) => void;
    hideAlpha?: boolean;
    hideInputs?: boolean;
    combinations?: ColorCombination | ColorCombination[];
    className?: string;
};
declare const _default: ({ theme, color, presets, onChange, hideAlpha, hideInputs, className, combinations }: ColorPickerProps) => React.JSX.Element;
export default _default;
