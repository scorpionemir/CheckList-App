import React from "react";

import TwoOptionCheckboxTable from "./TwoOptionCheckboxTable";

const RodStatus = ({ value, onChange }) => {

    return (
        <TwoOptionCheckboxTable
            title="وضعیت عصایی‌ها"
            label="وضعیت"
            options={[
                "سالم",
                "نیاز به تعویض یا آچارکشی",
            ]}
            value={value}
            onChange={onChange}
        />
    );
};

export default React.memo(RodStatus);