import React from "react";

const TableActionButtons: React.FC<ActionButtonsProps> = ({
    viewButtonColor = "#CCE1CD",
    blockButtonColor = "#FDE4EA",
    deleteButtonColor = "#FFE2E2",
    borderColor = "#01D312",
    viewButtonIcon,
    blockButtonIcon,
    deleteButtonIcon,
    onDeleteClick,
    onViewClick,
    onBlockClick
}) => {
    return (
        <div className="w-full flex gap-4">
            {/* View Button (conditionally rendered) */}
            {viewButtonIcon && onViewClick && (
                <button
                    className="rounded-full p-1 cursor-pointer"
                    style={{
                        backgroundColor: viewButtonColor,
                        border: `1px solid ${borderColor}`,
                        opacity: 0.57,
                        borderColor: `${borderColor}33`, // 20% opacity
                    }}
                    onClick={onViewClick}
                >
                    <img src={viewButtonIcon} className="w-4 h-4" />
                </button>
            )}

            {/* Block Button (conditionally rendered) */}
            {blockButtonIcon && onBlockClick && (
                <button
                    className="rounded-full p-1 cursor-pointer"
                    style={{
                        backgroundColor: blockButtonColor,
                    }}
                    onClick={onBlockClick}
                >
                    <img src={blockButtonIcon} className="w-4 h-4" />
                </button>
            )}

            {/* Delete Button */}
            {deleteButtonIcon && onDeleteClick && (
                <button
                    className="rounded-full p-1 cursor-pointer"
                    style={{ backgroundColor: deleteButtonColor }}
                    onClick={onDeleteClick}
                    title="Delete User"
                >
                    <img src={deleteButtonIcon} className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default TableActionButtons;
