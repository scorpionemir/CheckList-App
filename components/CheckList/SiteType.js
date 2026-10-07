import React from "react";

import TableContainer from "./Table/TableContainer";
import TableHeader from "./Table/TableHeader";
import TableRow from "./Table/TableRow";
import TableLabel from "./Table/TableLabel";
import TableValue from "./Table/TableValue";

import CheckboxGroup from "../CheckboxGroup";


const SiteType = ({ value, onChange }) => {

    const options = [
        "ایستگاه ثابت",
        "تکرار کننده",
    ];

    return (
        <TableContainer>

            <TableHeader title="نوع سایت / نوع کاربری" />

            <TableRow>

                <TableLabel title="نوع سایت / نوع کاربری" />

                <TableValue>

                    <CheckboxGroup
                        options={options}
                        value={value}
                        onChange={onChange}
                    />

                </TableValue>

            </TableRow>

        </TableContainer>
    );
};


export default React.memo(SiteType);