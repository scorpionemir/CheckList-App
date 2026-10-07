// import React from "react";

// import TableContainer from "./Table/TableContainer";
// import TableHeader from "./Table/TableHeader";
// import TableRow from "./Table/TableRow";
// import TableLabel from "./Table/TableLabel";
// import TableValue from "./Table/TableValue";

// import TextInputField from "./Location/TextInputField";


// const SiteInformation = ({
//     data = {
//         county: "",
//         city: "",
//         department: "",
//         site: "",
//     },
//     onChange,
// }) => {

//     return (
//         <TableContainer>

//             <TableHeader title="نام محل سایت" />


//             {/* شهرستان */}

//             <TableRow>

//                 <TableLabel title="شهرستان" />

//                 <TableValue>

//                     <TextInputField
//                         value={data.county}
//                         onChange={(value) =>
//                             onChange(
//                                 "siteInformation",
//                                 "county",
//                                 value
//                             )
//                         }
//                     />

//                 </TableValue>

//             </TableRow>


//             {/* شهر */}

//             <TableRow>

//                 <TableLabel title="شهر" />

//                 <TableValue>

//                     <TextInputField
//                         value={data.city}
//                         onChange={(value) =>
//                             onChange(
//                                 "siteInformation",
//                                 "city",
//                                 value
//                             )
//                         }
//                     />

//                 </TableValue>

//             </TableRow>


//             {/* اداره */}

//             <TableRow>

//                 <TableLabel title="اداره" />

//                 <TableValue>

//                     <TextInputField
//                         value={data.department}
//                         onChange={(value) =>
//                             onChange(
//                                 "siteInformation",
//                                 "department",
//                                 value
//                             )
//                         }
//                     />

//                 </TableValue>

//             </TableRow>


//             {/* سایت */}

//             <TableRow>

//                 <TableLabel title="سایت" />

//                 <TableValue>

//                     <TextInputField
//                         value={data.site}
//                         onChange={(value) =>
//                             onChange(
//                                 "siteInformation",
//                                 "site",
//                                 value
//                             )
//                         }
//                     />

//                 </TableValue>

//             </TableRow>

//         </TableContainer>
//     );
// };


// export default React.memo(SiteInformation);

// import React from "react";

// import TableContainer from "./Table/TableContainer";
// import TableHeader from "./Table/TableHeader";
// import TableRow from "./Table/TableRow";
// import TableLabel from "./Table/TableLabel";
// import TableValue from "./Table/TableValue";
// import TextInputField from "./Location/TextInputField";

// const SiteInformation = ({
//     data = {
//         county: "",
//         city: "",
//         department: "",
//         site: "",
//     },
//     onChange,
// }) => {
//     return (
//         <TableContainer>
//             <TableHeader title="نام محل سایت" />

//             {/* شهرستان */}
//             <TableRow>
//                 <TableLabel title="شهرستان" />

//                 <TableValue>
//                     <TextInputField
//                         value={data?.county ?? ""}
//                         onChange={(value) =>
//                             onChange(
//                                 "county",
//                                 value
//                             )
//                         }
//                     />
//                 </TableValue>
//             </TableRow>

//             {/* شهر */}
//             <TableRow>
//                 <TableLabel title="شهر" />

//                 <TableValue>
//                     <TextInputField
//                         value={data?.city ?? ""}
//                         onChange={(value) =>
//                             onChange(
//                                 "city",
//                                 value
//                             )
//                         }
//                     />
//                 </TableValue>
//             </TableRow>

//             {/* اداره */}
//             <TableRow>
//                 <TableLabel title="اداره" />

//                 <TableValue>
//                     <TextInputField
//                         value={data?.department ?? ""}
//                         onChange={(value) =>
//                             onChange(
//                                 "department",
//                                 value
//                             )
//                         }
//                     />
//                 </TableValue>
//             </TableRow>

//             {/* سایت */}
//             <TableRow>
//                 <TableLabel title="سایت" />

//                 <TableValue>
//                     <TextInputField
//                         value={data?.site ?? ""}
//                         onChange={(value) =>
//                             onChange(
//                                 "site",
//                                 value
//                             )
//                         }
//                     />
//                 </TableValue>
//             </TableRow>
//         </TableContainer>
//     );
// };

// export default React.memo(SiteInformation);

import React from "react";

import TableContainer from "./Table/TableContainer";
import TableHeader from "./Table/TableHeader";
import TableRow from "./Table/TableRow";
import TableLabel from "./Table/TableLabel";
import TableValue from "./Table/TableValue";

import TextInputField from "./Location/TextInputField";
import LocationPicker from "./Location/LocationPicker";

const SiteInformation = ({
    data = {
        province: "",
        city: "",
        department: "",
        site: "",
    },
    onChange,
}) => {
    const handleProvinceChange = (
        province
    ) => {
        /*
         * با تغییر استان،
         * شهر قبلی باید پاک شود.
         */

        onChange(
            "province",
            province
        );

        onChange(
            "city",
            ""
        );
    };

    return (
        <TableContainer>
            <TableHeader title="نام محل سایت" />

            {/* استان */}
            <TableRow>
                <TableLabel title="استان" />

                <TableValue>
                    <LocationPicker
                        type="province"
                        value={
                            data?.province ??
                            ""
                        }
                        onChange={
                            handleProvinceChange
                        }
                    />
                </TableValue>
            </TableRow>

            {/* شهر */}
            <TableRow>
                <TableLabel title="شهر" />

                <TableValue>
                    <LocationPicker
                        type="city"
                        value={
                            data?.city ??
                            ""
                        }
                        province={
                            data?.province ??
                            ""
                        }
                        disabled={
                            !data?.province
                        }
                        onChange={(
                            city
                        ) =>
                            onChange(
                                "city",
                                city
                            )
                        }
                    />
                </TableValue>
            </TableRow>

            {/* اداره */}
            <TableRow>
                <TableLabel title="اداره" />

                <TableValue>
                    <TextInputField
                        value={
                            data?.department ??
                            ""
                        }
                        onChange={(
                            value
                        ) =>
                            onChange(
                                "department",
                                value
                            )
                        }
                    />
                </TableValue>
            </TableRow>

            {/* سایت */}
            <TableRow>
                <TableLabel title="سایت" />

                <TableValue>
                    <TextInputField
                        value={
                            data?.site ??
                            ""
                        }
                        onChange={(
                            value
                        ) =>
                            onChange(
                                "site",
                                value
                            )
                        }
                    />
                </TableValue>
            </TableRow>
        </TableContainer>
    );
};

export default React.memo(
    SiteInformation
);