import React from "react";

import TwoOptionCheckboxTable from "./TwoOptionCheckboxTable";

const GuyWireStatus = ({ value, onChange }) => {

    return (
        <TwoOptionCheckboxTable
            title="وضعیت مهارکش‌ها"
            label="وضعیت"
            options={[
                "سالم",
                "نیاز به تعویض یا رگلاژ",
            ]}
            value={value}
            onChange={onChange}
        />
    );
};

export default React.memo(GuyWireStatus);