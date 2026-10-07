const isEmpty = (value) => {
    return (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
    );
};

const isValidNumber = (value) => {
    if (isEmpty(value)) {
        return false;
    }

    const number = Number(value);

    return Number.isFinite(number);
};

const validateVisit = (visit, errors) => {
    if (!visit) {
        errors.visit = "اطلاعات بازدید وارد نشده است.";
        return;
    }

    if (isEmpty(visit.date)) {
        errors.date = "تاریخ بازدید را وارد کنید.";
    }

    if (isEmpty(visit.entryTime)) {
        errors.entryTime = "ساعت ورود را وارد کنید.";
    }

    if (isEmpty(visit.exitTime)) {
        errors.exitTime = "ساعت خروج را وارد کنید.";
    }

    if (isEmpty(visit.visitCount)) {
        errors.visitCount = "تعداد بازدید را وارد کنید.";
    } else if (!isValidNumber(visit.visitCount)) {
        errors.visitCount = "تعداد بازدید باید عدد باشد.";
    } else if (Number(visit.visitCount) < 1) {
        errors.visitCount = "تعداد بازدید باید حداقل 1 باشد.";
    }
};

const validateSiteInformation = (siteInformation, errors) => {
    if (!siteInformation) {
        errors.siteInformation =
            "اطلاعات سایت وارد نشده است.";

        return;
    }

    if (isEmpty(siteInformation.province)) {
        errors.province = "استان را وارد کنید.";
    }

    if (isEmpty(siteInformation.city)) {
        errors.city = "شهر را وارد کنید.";
    }

    if (isEmpty(siteInformation.department)) {
        errors.department =
            "اداره/واحد را وارد کنید.";
    }

    if (isEmpty(siteInformation.site)) {
        errors.site = "نام سایت را وارد کنید.";
    }
};

/*
|--------------------------------------------------------------------------
| Checklist 1 - Antenna
|--------------------------------------------------------------------------
*/

export const validateAntennaChecklist = (data) => {
    const errors = {};

    if (!data) {
        return {
            isValid: false,
            errors: {
                checklist: "اطلاعات چک لیست موجود نیست.",
            },
        };
    }

    validateVisit(data.visit, errors);

    validateSiteInformation(
        data.siteInformation,
        errors
    );

    const location = data.siteLocation;

if (!location?.source) {

    errors.siteLocation =
        "روش ثبت موقعیت سایت را انتخاب کنید.";

} else {

    const coordinates =
        location.source === "gps"
            ? location.gps
            : location.manual;


    if (
        coordinates?.latitude === null ||
        coordinates?.latitude === undefined
    ) {

        errors.siteLocationLatitude =
            "عرض جغرافیایی را وارد کنید.";

    } else if (
        !isValidNumber(
            coordinates.latitude
        )
    ) {

        errors.siteLocationLatitude =
            "عرض جغرافیایی باید عدد باشد.";

    } else if (
        Number(coordinates.latitude) < -90 ||
        Number(coordinates.latitude) > 90
    ) {

        errors.siteLocationLatitude =
            "عرض جغرافیایی باید بین 90- و 90 باشد.";

    }


    if (
        coordinates?.longitude === null ||
        coordinates?.longitude === undefined
    ) {

        errors.siteLocationLongitude =
            "طول جغرافیایی را وارد کنید.";

    } else if (
        !isValidNumber(
            coordinates.longitude
        )
    ) {

        errors.siteLocationLongitude =
            "طول جغرافیایی باید عدد باشد.";

    } else if (
        Number(coordinates.longitude) < -180 ||
        Number(coordinates.longitude) > 180
    ) {

        errors.siteLocationLongitude =
            "طول جغرافیایی باید بین 180- و 180 باشد.";

    }
}

    /*
    |--------------------------------------------------------------------------
    | Site Type
    |--------------------------------------------------------------------------
    */

    if (isEmpty(data.siteType)) {
        errors.siteType =
            "نوع سایت را انتخاب کنید.";
    }

    /*
    |--------------------------------------------------------------------------
    | Wireless Antenna Connectors
    |--------------------------------------------------------------------------
    */

    if (
        !Array.isArray(
            data.wirelessAntennaConnectors?.selectedOptions
        ) ||
        data.wirelessAntennaConnectors.selectedOptions.length === 0
    ) {
        errors.wirelessAntennaConnectors =
            "حداقل یک نوع کانکتور را انتخاب کنید.";
    }

    /*
    |--------------------------------------------------------------------------
    | Antenna Cable
    |--------------------------------------------------------------------------
    */

    if (isEmpty(data.antennaCable?.cableType)) {
        errors.cableType =
            "نوع کابل را انتخاب کنید.";
    }

    if (isEmpty(data.antennaCable?.length)) {
        errors.cableLength =
            "طول کابل را وارد کنید.";
    } else if (
        !isValidNumber(data.antennaCable.length)
    ) {
        errors.cableLength =
            "طول کابل باید عدد باشد.";
    } else if (
        Number(data.antennaCable.length) < 0
    ) {
        errors.cableLength =
            "طول کابل باید بیشتر از صفر باشد.";
    }

    /*
    |--------------------------------------------------------------------------
    | Antenna Type
    |--------------------------------------------------------------------------
    */

    if (isEmpty(data.antennaType?.antennaType)) {
        errors.antennaType =
            "نوع آنتن را انتخاب کنید.";
    }

    /*
    |--------------------------------------------------------------------------
    | Tower
    |--------------------------------------------------------------------------
    */

    if (isEmpty(data.tower?.towerType)) {
        errors.towerType =
            "نوع دکل را انتخاب کنید.";
    }

    if (isEmpty(data.tower?.baseType)) {
        errors.baseType =
            "نوع قاعده دکل را انتخاب کنید.";
    }

/*
|--------------------------------------------------------------------------
| Conditional Tower Description
|--------------------------------------------------------------------------
| توضیحات فقط زمانی اجباری است که نوع دکل
| «خود ایستا» انتخاب شده باشد.
*/

    if (data.tower?.towerType === "خود ایستا") {
        if (isEmpty(data.tower?.baseDescription)) {
            errors.baseDescription =
                "برای دکل خود ایستا، توضیحات قاعده دکل را وارد کنید.";
        }
    }

    /*
    | Base Type only applies when it has been selected/used.
    | We don't force it here because its requirement depends
    | on the selected tower type.
    */

    /*
    |--------------------------------------------------------------------------
    | Tower Installation Location
    |--------------------------------------------------------------------------
    */

    if (isEmpty(data.towerInstallationLocation)) {
        errors.towerInstallationLocation =
            "محل نصب دکل را انتخاب کنید.";
    }

    /*
    |--------------------------------------------------------------------------
    | Tower Height
    |--------------------------------------------------------------------------
    */

    if (isEmpty(data.towerHeight?.height)) {
        errors.towerHeight =
            "ارتفاع دکل را وارد کنید.";
    } else if (!isValidNumber(data.towerHeight.height)) {
        errors.towerHeight =
            "ارتفاع دکل باید عدد باشد.";
    } else if (Number(data.towerHeight.height) <= 0) {
        errors.towerHeight =
            "ارتفاع دکل باید بیشتر از صفر باشد.";
    }

    const antennaHeights = data.antennaType?.heights;

    if (Array.isArray(antennaHeights)) {
        antennaHeights.forEach((height, index) => {
            if (isEmpty(height)) {
                return;
            }

            if (!isValidNumber(height)) {
                errors[`antennaHeight${index}`] =
                    `ارتفاع آنتن ${index + 1} باید عدد باشد.`;
                return;
            }

            if (Number(height) <= 0) {
                errors[`antennaHeight${index}`] =
                    `ارتفاع آنتن ${index + 1} باید بیشتر از صفر باشد.`;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Tower Status Tables
    |--------------------------------------------------------------------------
    */

    if (isEmpty(data.balancePlateStatus)) {
        errors.balancePlateStatus =
            "وضعیت صفحه تعادل را انتخاب کنید.";
    }

    if (isEmpty(data.guyWireStatus)) {
        errors.guyWireStatus =
            "وضعیت مهارکش را انتخاب کنید.";
    }

    if (isEmpty(data.rodStatus)) {
        errors.rodStatus =
            "وضعیت عصایی را انتخاب کنید.";
    }

    if (isEmpty(data.towerBaseStatus)) {
        errors.towerBaseStatus =
            "وضعیت پایه دکل را انتخاب کنید.";
    }

    /*
    |--------------------------------------------------------------------------
    | Earthing System
    |--------------------------------------------------------------------------
    */

    if (
        isEmpty(
            data.earthingSystem?.selectedOption
        )
    ) {
        errors.earthingSystem =
            "وضعیت سیستم ارتینگ را انتخاب کنید.";
    } else if (
        data.earthingSystem.selectedOption === "ندارد"
    ) {
        if (
            isEmpty(
                data.earthingSystem.description
            )
        ) {
            errors.earthingSystemDescription =
                "برای گزینه انتخاب‌شده، توضیحات را وارد کنید.";
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Earth Resistance
    |--------------------------------------------------------------------------
    */

    if (
        isEmpty(
            data.earthResistance?.selectedOption
        )
    ) {
        errors.earthResistance =
            "وضعیت مقاومت چاه ارت را انتخاب کنید.";
    }

    /*
    | Based on the current checklist design,
    | the Ohm value is required for the second option.
    */

    if (
        data.earthResistance?.selectedOption ===
        "آب ریز ندارد"
    ) {
        if (
            isEmpty(
                data.earthResistance?.ohmValue
            )
        ) {
            errors.ohmValue =
                "مقدار مقاومت چاه ارت را وارد کنید.";
        } else if (
            !isValidNumber(
                data.earthResistance.ohmValue
            )
        ) {
            errors.ohmValue =
                "مقدار مقاومت چاه ارت باید عدد باشد.";
        } else if (
            Number(
                data.earthResistance.ohmValue
            ) <= 0
        ) {
            errors.ohmValue =
                "مقدار مقاومت چاه ارت باید بیشتر از صفر باشد.";
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Mast Head Light
    |--------------------------------------------------------------------------
    */

    const mastHeadOptions =
        data.mastHeadLight?.selectedOptions;

    if (
        !Array.isArray(mastHeadOptions) ||
        mastHeadOptions.length === 0
    ) {
        errors.mastHeadLight =
            "وضعیت چراغ سر دکل را انتخاب کنید.";
    } else {
        if (
            mastHeadOptions.includes("چراغ ندارد") &&
            mastHeadOptions.length > 1
        ) {
            errors.mastHeadLight =
                "گزینه «چراغ ندارد» نمی‌تواند همراه با گزینه دیگری انتخاب شود.";
        }

        if (!mastHeadOptions.includes("چراغ ندارد")) {

            const hasPowerSource =
                mastHeadOptions.includes("برق شهری") ||
                mastHeadOptions.includes("خورشیدی");

            const hasCondition =
                mastHeadOptions.includes("سالم") ||
                mastHeadOptions.includes("نیاز به تعویض");

            if (!hasPowerSource) {
                errors.mastHeadLightPower =
                    "منبع تغذیه چراغ را انتخاب کنید.";
            }

            if (!hasCondition) {
                errors.mastHeadLightCondition =
                    "وضعیت چراغ را انتخاب کنید.";
            }
        }

        if (
            mastHeadOptions.includes("برق شهری") &&
            mastHeadOptions.includes("خورشیدی")
        ) {
            errors.mastHeadLight =
                "منبع تغذیه چراغ نمی‌تواند همزمان برق شهری و خورشیدی باشد.";
        }

        if (
            mastHeadOptions.includes("سالم") &&
            mastHeadOptions.includes("نیاز به تعویض")
        ) {
            errors.mastHeadLight =
                "وضعیت چراغ نمی‌تواند همزمان سالم و نیاز به تعویض باشد.";
        }
    
    return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }
};

/*
|--------------------------------------------------------------------------
| Checklist 2 - Wireless
|--------------------------------------------------------------------------
*/

export const validateWirelessChecklist = (data) => {
    const errors = {};

    if (!data) {
        return {
            isValid: false,
            errors: {
                checklist: "اطلاعات چک لیست موجود نیست.",
            },
        };
    }

    validateVisit(data.visit, errors);

    validateSiteInformation(
        data.siteInformation,
        errors
    );

    /*
    |--------------------------------------------------------------------------
    | Wireless Site Type
    |--------------------------------------------------------------------------
    */

    if (isEmpty(data.wirelessSiteType)) {
        errors.wirelessSiteType =
            "نوع سایت بی‌سیم را انتخاب کنید.";
    }

    /*
    |--------------------------------------------------------------------------
    | Serial Number
    |--------------------------------------------------------------------------
    */

    if (isEmpty(data.serialNumber)) {
        errors.serialNumber =
            "شماره سریال را وارد کنید.";
    }

    /*
    |--------------------------------------------------------------------------
    | Asset Number
    |--------------------------------------------------------------------------
    */

    if (isEmpty(data.assetNumber)) {
        errors.assetNumber =
            "شماره اموال را وارد کنید.";
    }

    /*
    |--------------------------------------------------------------------------
    | Wireless Body Condition
    |--------------------------------------------------------------------------
    */

    const bodyOptions =
    data.wirelessBodyCondition?.selectedOptions;

if (
    !Array.isArray(bodyOptions) ||
    bodyOptions.length === 0
) {
    errors.wirelessBodyCondition =
        "وضعیت بدنه را انتخاب کنید.";
} else if (bodyOptions.length !== 1) {
    errors.wirelessBodyCondition =
        "فقط یک وضعیت برای بدنه انتخاب کنید.";
}

    /*
    |--------------------------------------------------------------------------
    | Power Supply Condition
    |--------------------------------------------------------------------------
    */

    const powerSupplyOptions =
    data.powerSupplyCondition?.selectedOptions;

if (
    !Array.isArray(powerSupplyOptions) ||
    powerSupplyOptions.length === 0
) {
    errors.powerSupplyCondition =
        "وضعیت منبع تغذیه را انتخاب کنید.";
} else {

    const hasMainCondition =
        powerSupplyOptions.includes("سالم") ||
        powerSupplyOptions.includes("ایراد دارد");

    const hasBatteryCondition =
        powerSupplyOptions.includes("باتری سالم") ||
        powerSupplyOptions.includes("باتری نیاز به تعویض");

    if (!hasMainCondition) {
        errors.powerSupplyMainCondition =
            "وضعیت اصلی منبع تغذیه را انتخاب کنید.";
    }

    if (!hasBatteryCondition) {
        errors.powerSupplyBatteryCondition =
            "وضعیت باتری را انتخاب کنید.";
    }

    if (
        powerSupplyOptions.includes("سالم") &&
        powerSupplyOptions.includes("ایراد دارد")
    ) {
        errors.powerSupplyMainCondition =
            "وضعیت منبع تغذیه نمی‌تواند همزمان سالم و دارای ایراد باشد.";
    }

    if (
        powerSupplyOptions.includes("باتری سالم") &&
        powerSupplyOptions.includes("باتری نیاز به تعویض")
    ) {
        errors.powerSupplyBatteryCondition =
            "وضعیت باتری نمی‌تواند همزمان سالم و نیازمند تعویض باشد.";
    }
}

    /*
    |--------------------------------------------------------------------------
    | Power
    |--------------------------------------------------------------------------
    */

    if (isEmpty(data.power?.outputPower)) {
        errors.outputPower =
            "توان خروجی را وارد کنید.";
    } else if (
        !isValidNumber(data.power.outputPower)
    ) {
        errors.outputPower =
            "توان خروجی باید عدد باشد.";
    } else if (
        Number(data.power.outputPower) < 0
    ) {
        errors.outputPower =
            "توان خروجی نمی‌تواند منفی باشد.";
    }

    if (isEmpty(data.power?.returnPower)) {
        errors.returnPower =
            "توان برگشتی را وارد کنید.";
    } else if (
        !isValidNumber(data.power.returnPower)
    ) {
        errors.returnPower =
            "توان برگشتی باید عدد باشد.";
    } else if (
        Number(data.power.returnPower) < 0
    ) {
        errors.returnPower =
            "توان برگشتی نمی‌تواند منفی باشد.";
    }

    if (isEmpty(data.power?.vswr)) {
        errors.vswr =
            "مقدار VSWR را وارد کنید.";
    } else if (
        !isValidNumber(data.power.vswr)
    ) {
        errors.vswr =
            "مقدار VSWR باید عدد باشد.";
    } else if (
        Number(data.power.vswr) <= 0
    ) {
        errors.vswr =
            "مقدار VSWR نمی‌تواند منفی باشد.";
    }

    /*
    |--------------------------------------------------------------------------
    | Vehicle Equipment
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | Vehicle Equipment
    |--------------------------------------------------------------------------
*/

if (!data.vehicleEquipment) {
    errors.vehicleEquipment =
        "اطلاعات تجهیزات خودرو وارد نشده است.";
} else {
    const vehicleEquipment =
        data.vehicleEquipment;

    const validPlateLetters = [
        "الف",
        "ب",
        "پ",
        "ت",
        "ث",
        "ج",
        "چ",
        "ح",
        "خ",
        "د",
        "ذ",
        "ر",
        "ز",
        "ژ",
        "س",
        "ش",
        "ص",
        "ض",
        "ط",
        "ظ",
        "ع",
        "غ",
        "ف",
        "ق",
        "ک",
        "گ",
        "ل",
        "م",
        "ن",
        "و",
        "ه",
        "ی",
    ];

    // دو رقم اول پلاک
    if (
        isEmpty(
            vehicleEquipment.firstTwoNumbers
        )
    ) {
        errors.firstTwoNumbers =
            "دو رقم اول پلاک را وارد کنید.";
    } else if (
        !/^\d{2}$/.test(
            String(
                vehicleEquipment.firstTwoNumbers
            )
        )
    ) {
        errors.firstTwoNumbers =
            "دو رقم اول پلاک باید دقیقاً 2 رقم باشد.";
    }

    // حرف پلاک
    if (
        isEmpty(
            vehicleEquipment.letter
        )
    ) {
        errors.letter =
            "حرف پلاک را انتخاب کنید.";
    } else if (
        !validPlateLetters.includes(
            vehicleEquipment.letter
        )
    ) {
        errors.letter =
            "حرف پلاک معتبر نیست.";
    }

    // سه رقم پلاک
    if (
        isEmpty(
            vehicleEquipment.lastThreeNumbers
        )
    ) {
        errors.lastThreeNumbers =
            "سه رقم پلاک را وارد کنید.";
    } else if (
        !/^\d{3}$/.test(
            String(
                vehicleEquipment.lastThreeNumbers
            )
        )
    ) {
        errors.lastThreeNumbers =
            "سه رقم پلاک باید دقیقاً 3 رقم باشد.";
    }

    // کد شهر
    if (
        isEmpty(
            vehicleEquipment.cityCode
        )
    ) {
        errors.cityCode =
            "کد شهر را وارد کنید.";
    } else if (
        !/^\d{2}$/.test(
            String(
                vehicleEquipment.cityCode
            )
        )
    ) {
        errors.cityCode =
            "کد شهر باید دقیقاً 2 رقم باشد.";
    }

    // نوع خودرو
    if (
        isEmpty(
            vehicleEquipment.vehicleType
        )
    ) {
        errors.vehicleType =
            "نوع خودرو را انتخاب کنید.";
    }

    // تجهیزات نصب‌شده
    if (
        isEmpty(
            vehicleEquipment.installedEquipment
        )
    ) {
        errors.installedEquipment =
            "تجهیزات نصب‌شده را وارد کنید.";
    }

    // نوع آنتن خودرو
    if (
        isEmpty(
            vehicleEquipment.antennaType
        )
    ) {
        errors.vehicleAntennaType =
            "نوع آنتن خودرو را وارد کنید.";
    }
}

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};