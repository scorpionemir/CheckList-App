import React from "react";

import TableContainer from "./Table/TableContainer";
import TableHeader from "./Table/TableHeader";
import TableRow from "./Table/TableRow";
import TableLabel from "./Table/TableLabel";
import TableValue from "./Table/TableValue";

import DateInput from "./Location/GetDate";
import TimeInput from "./Location/GetTime";
import NumberInput from "./Location/GetNumber";


const Date_Time_Location = ({
    data = {
        date: null,
        entryTime: null,
        exitTime: null,
        visitCount: null,
    },
    onChange,
}) => {

    return (
        <TableContainer>

            <TableHeader title="اطلاعات بازدید" />


            {/* تاریخ */}

            <TableRow>

                <TableLabel title="تاریخ" />

                <TableValue>

                    <DateInput
                        value={data.date}
                        onChange={(value) =>
                            onChange(
                                "visit",
                                "date",
                                value
                            )
                        }
                    />

                </TableValue>

            </TableRow>


            {/* ساعت ورود */}

            <TableRow>

                <TableLabel title="ساعت ورود" />

                <TableValue>

                    <TimeInput
                        title=""
                        value={data.entryTime}
                        onChange={(value) =>
                            onChange(
                                "visit",
                                "entryTime",
                                value
                            )
                        }
                    />

                </TableValue>

            </TableRow>


            {/* ساعت خروج */}

            <TableRow>

                <TableLabel title="ساعت خروج" />

                <TableValue>

                    <TimeInput
                        title=""
                        value={data.exitTime}
                        onChange={(value) =>
                            onChange(
                                "visit",
                                "exitTime",
                                value
                            )
                        }
                    />

                </TableValue>

            </TableRow>


            {/* بازدید دوره‌ای */}

            <TableRow>

                <TableLabel title="بازدید دوره‌ای" />

                <TableValue>

                    <NumberInput
                        title=""
                        value={data.visitCount}
                        onChange={(value) =>
                            onChange(
                                "visit",
                                "visitCount",
                                value
                            )
                        }
                    />

                </TableValue>

            </TableRow>

        </TableContainer>
    );
};


export default React.memo(Date_Time_Location);