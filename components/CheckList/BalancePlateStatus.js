import React from "react";

import TwoOptionCheckboxTable from "./TwoOptionCheckboxTable";

const BalancePlateStatus = ({ value, onChange }) => {

    return (
        <TwoOptionCheckboxTable
            title="وضعیت صفحه تعادل"
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

export default React.memo(BalancePlateStatus);