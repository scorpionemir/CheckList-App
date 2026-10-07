import React from "react";

import TwoOptionCheckboxTable from "./TwoOptionCheckboxTable";

const TowerBaseStatus = ({ value, onChange }) => {

    return (
        <TwoOptionCheckboxTable
            title="وضعیت بیس دکل"
            label="وضعیت"
            options={[
                "سالم",
                "نیاز به رگلاژ یا تعویض یا آچارکشی",
            ]}
            value={value}
            onChange={onChange}
        />
    );
};

export default React.memo(TowerBaseStatus);