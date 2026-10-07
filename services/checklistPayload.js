const ANTENNA_CHECKLIST_TYPE_ID =
    "90286988-53d6-4a65-bd87-f5771fc95960";

// بعد از ساخت ChecklistType مربوط به Wireless
// UUID واقعی PostgreSQL را اینجا قرار بده.
const WIRELESS_CHECKLIST_TYPE_ID =
    "513e9202-7fb3-47a3-9f5b-ab8e1beb3ca0";


const toNumberOrNull = (value) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
};


const toISOStringOrNull = (value) => {
    if (!value) {
        return null;
    }

    const date = value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
};


const toTimeOnly = (value) => {
    if (!value) {
        return null;
    }

    const date = value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
};


const toDateOnly = (value) => {
    if (!value) {
        return null;
    }

    const date = value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


export const prepareAntennaChecklistPayload = (data) => {
    const checklistDate = toDateOnly(data?.visit?.date);

    return {
        checklistTypeId: ANTENNA_CHECKLIST_TYPE_ID,

        checklistDate,

        siteName: data?.siteInformation?.site || "",

        data: {
            visit: {
                date: checklistDate,

                entryTime: toTimeOnly(
                    data?.visit?.entryTime
                ),

                exitTime: toTimeOnly(
                    data?.visit?.exitTime
                ),

                visitCount: toNumberOrNull(
                    data?.visit?.visitCount
                ),
            },

            siteInformation: {
                province : data?.siteInformation?.province  || "",

                city: data?.siteInformation?.city || "",

                department:
                    data?.siteInformation?.department || "",

                site: data?.siteInformation?.site || "",
            },

            siteLocation: {
                source:
                    data?.siteLocation?.source || null,

                gps: {
                    latitude: toNumberOrNull(
                        data?.siteLocation?.gps?.latitude
                    ),

                    longitude: toNumberOrNull(
                        data?.siteLocation?.gps?.longitude
                    ),
                },

                manual: {
                    latitude: toNumberOrNull(
                        data?.siteLocation?.manual?.latitude
                    ),

                    longitude: toNumberOrNull(
                        data?.siteLocation?.manual?.longitude
                    ),
                },
            },

            siteType: data?.siteType || null,

            wirelessAntennaConnectors: {
                selectedOptions:
                    Array.isArray(
                        data?.wirelessAntennaConnectors
                            ?.selectedOptions
                    )
                        ? data.wirelessAntennaConnectors.selectedOptions
                        : [],

                description:
                    data?.wirelessAntennaConnectors
                        ?.description || "",
            },

            antennaCable: {
                cableType:
                    data?.antennaCable?.cableType || null,

                length: toNumberOrNull(
                    data?.antennaCable?.length
                ),

                description:
                    data?.antennaCable?.description || "",
            },

            antennaType: {
                antennaType:
                    data?.antennaType?.antennaType || null,

                heights:
                    Array.isArray(data?.antennaType?.heights)
                        ? data.antennaType.heights
                            .map(toNumberOrNull)
                            .filter(
                                (value) => value !== null
                            )
                        : [],

                description:
                    data?.antennaType?.description || "",
            },

            tower: {
                towerType:
                    data?.tower?.towerType || null,

                baseType:
                    data?.tower?.baseType || null,

                baseDescription:
                    data?.tower?.baseDescription || null,
            },

            towerInstallationLocation:
                data?.towerInstallationLocation || null,

            towerHeight: {
                height: toNumberOrNull(
                    data?.towerHeight?.height
                ),

                description:
                    data?.towerHeight?.description || "",
            },

            balancePlateStatus:
                data?.balancePlateStatus || null,

            guyWireStatus:
                data?.guyWireStatus || null,

            rodStatus:
                data?.rodStatus || null,

            towerBaseStatus:
                data?.towerBaseStatus || null,

            earthingSystem: {
                selectedOption:
                    data?.earthingSystem?.selectedOption || null,

                description:
                    data?.earthingSystem?.description || "",
            },

            earthResistance: {
                selectedOption:
                    data?.earthResistance?.selectedOption || null,

                ohmValue: toNumberOrNull(
                    data?.earthResistance?.ohmValue
                ),
            },

            mastHeadLight: {
                selectedOptions:
                    Array.isArray(
                        data?.mastHeadLight?.selectedOptions
                    )
                        ? data.mastHeadLight.selectedOptions
                        : [],
            },
        },
    };
};


export const prepareWirelessChecklistPayload = (data) => {
    const checklistDate = toDateOnly(data?.visit?.date);

    return {
        checklistTypeId: WIRELESS_CHECKLIST_TYPE_ID,

        checklistDate,

        siteName: data?.siteInformation?.site || "",

        data: {
            visit: {
                date: checklistDate,

                entryTime: toTimeOnly(
                    data?.visit?.entryTime
                ),

                exitTime: toTimeOnly(
                    data?.visit?.exitTime
                ),

                visitCount: toNumberOrNull(
                    data?.visit?.visitCount
                ),
            },

            siteInformation: {
                province :
                    data?.siteInformation?.province  || "",

                city:
                    data?.siteInformation?.city || "",

                department:
                    data?.siteInformation?.department || "",

                site:
                    data?.siteInformation?.site || "",
            },

            wirelessSiteType:
                data?.wirelessSiteType || null,

            serialNumber:
                data?.serialNumber || "",

            assetNumber:
                data?.assetNumber || "",

            wirelessBodyCondition: {
                selectedOptions:
                    Array.isArray(
                        data?.wirelessBodyCondition
                            ?.selectedOptions
                    )
                        ? data.wirelessBodyCondition.selectedOptions
                        : [],

                description:
                    data?.wirelessBodyCondition
                        ?.description || "",
            },

            powerSupplyCondition: {
                selectedOptions:
                    Array.isArray(
                        data?.powerSupplyCondition
                            ?.selectedOptions
                    )
                        ? data.powerSupplyCondition.selectedOptions
                        : [],

                description:
                    data?.powerSupplyCondition
                        ?.description || "",
            },

            power: {
                outputPower: toNumberOrNull(
                    data?.power?.outputPower
                ),

                returnPower: toNumberOrNull(
                    data?.power?.returnPower
                ),

                vswr: toNumberOrNull(
                    data?.power?.vswr
                ),
            },

            vehicleEquipment: {
                firstTwoNumbers:
                    data?.vehicleEquipment
                        ?.firstTwoNumbers || "",

                letter:
                    data?.vehicleEquipment?.letter || "",

                lastThreeNumbers:
                    data?.vehicleEquipment
                        ?.lastThreeNumbers || "",

                cityCode:
                    data?.vehicleEquipment?.cityCode || "",

                vehicleType:
                    data?.vehicleEquipment?.vehicleType || "",

                installedEquipment:
                    data?.vehicleEquipment
                        ?.installedEquipment || "",

                antennaType:
                    data?.vehicleEquipment?.antennaType || "",

                description:
                    data?.vehicleEquipment?.description || "",
            },
        },
    };
};