import React from "react";

interface ReportCountProps {
    count: number;
}

const TableReportCount: React.FC<ReportCountProps> = ({ count }) => {
    return (
        <div className=" w-full">
            <p className="font-poppins  text-reporttextcolor text-sm">
                {count} {count > 1 ? "reports" : "report"}
            </p>
        </div>
    );
};

export default TableReportCount;
