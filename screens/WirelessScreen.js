import React, {
    useEffect,
    useState,
    useCallback
} from "react";

import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
} from "react-native";

import Date_Time_Location from "../components/CheckList/Date_Time_Location";
import SiteInformation from "../components/CheckList/SiteInformation";
import WirelessSiteType from "../components/CheckList/WirelessSiteType";
import ChecklistActions from "../components/CheckList/ChecklistActions";
import SerialNumber from "../components/CheckList/SerialNumber";
import AssetNumber from "../components/CheckList/AssetNumber";
import WirelessBodyCondition from "../components/CheckList/WirelessBodyCondition";
import PowerSupplyCondition from "../components/CheckList/PowerSupplyCondition";
import Power from "../components/CheckList/Power";
import VehicleEquipment from "../components/CheckList/VehicleEquipment";

import {
    createChecklist,
    getMyChecklistById,
    updateChecklist,
} from "../services/api";

import {
    deleteDraft,
    getDraftById,
    saveDraft,
} from "../services/localDatabase";

import { useAuth } from "../context/AuthContext";

import {
    validateWirelessChecklist,
} from "../services/checklistValidation";

import {
    normalizeChecklistData,
} from "../services/normalizeChecklistData";


const WIRELESS_CHECKLIST_TYPE_ID =
    "513e9202-7fb3-47a3-9f5b-ab8e1beb3ca0";


const INITIAL_CHECKLIST_DATA = {

    visit: {
        date: null,
        entryTime: null,
        exitTime: null,
        visitCount: null,
    },

    siteInformation: {
        province: "",
        city: "",
        department: "",
        site: "",
    },

    wirelessSiteType: null,

    serialNumber: "",

    assetNumber: "",

    wirelessBodyCondition: {
        selectedOptions: [],
        description: "",
    },

    powerSupplyCondition: {
        selectedOptions: [],
        description: "",
    },

    power: {
        outputPower: "",
        returnPower: "",
        vswr: "",
    },

    vehicleEquipment: {
        firstTwoNumbers: "",
        letter: "",
        lastThreeNumbers: "",
        cityCode: "",
        vehicleType: "",
        installedEquipment: "",
        antennaType: "",
        description: "",
    },

};


const WirelessScreen = ({
    navigation,
    route,
}) => {

    const {
        user,
    } = useAuth();


    const [
        checklistData,
        setChecklistData,
    ] = useState(
        INITIAL_CHECKLIST_DATA
    );


    const [
        currentDraftId,
        setCurrentDraftId,
    ] = useState(null);


    const [
        editingChecklistId,
        setEditingChecklistId,
    ] = useState(null);

    const [
    loadingEdit,
    setLoadingEdit,
    ] = useState(false);

    const [
    errors,
    setErrors,
    ] = useState({});


    /* =========================================================
       Load Edit Checklist
    ========================================================= */

    useEffect(() => {
    const editChecklistId =
        route?.params?.editChecklistId;

    if (!editChecklistId) {
        return;
    }

    const loadChecklistForEdit =
        async () => {
            try {
                setLoadingEdit(true);

                const response =
                    await getMyChecklistById(
                        editChecklistId
                    );

                const checklist =
                    response?.checklist;

                if (!checklist) {
                    Alert.alert(
                        "خطا",
                        "چک‌لیست موردنظر پیدا نشد."
                    );

                    navigation.setParams({
                        editChecklistId: undefined,
                    });

                    return;
                }

                if (!checklist.edit_allowed) {
                    Alert.alert(
                        "ویرایش مجاز نیست",
                        "برای این چک‌لیست مجوز ویرایش صادر نشده است."
                    );

                    navigation.setParams({
                        editChecklistId: undefined,
                    });

                    return;
                }

                if (
                    checklist.checklist_type_id !==
                    WIRELESS_CHECKLIST_TYPE_ID
                ) {
                    Alert.alert(
                        "خطا",
                        "این چک‌لیست مربوط به بخش وایرلس نیست."
                    );

                    navigation.setParams({
                        editChecklistId: undefined,
                    });

                    return;
                }

                setChecklistData(
    normalizeChecklistData(
        checklist.data ||
            INITIAL_CHECKLIST_DATA
    )
);

                setEditingChecklistId(
                    checklist.id
                );

            } catch (error) {

                console.error(
                    "Load wireless checklist for edit error:",
                    error
                );

                Alert.alert(
                    "خطا",
                    error?.message ||
                        "بارگذاری چک‌لیست برای ویرایش انجام نشد."
                );

                navigation.setParams({
                    editChecklistId: undefined,
                });

            } finally {
                setLoadingEdit(false);
            }
        };

    loadChecklistForEdit();

}, [
    route?.params?.editChecklistId,
    navigation,
]);


    /* =========================================================
       Load Draft
    ========================================================= */

    useEffect(() => {

        const draftId =
            route?.params?.draftId;


        /*
            اگر در حالت Edit هستیم،
            Draft نباید فرم را overwrite کند.
        */
        if (
            !draftId ||
            route?.params?.editChecklistId
        ) {
            return;
        }


        const loadDraft =
            async () => {

                try {

                    if (!user?.id) {
                        return;
                    }


                    const draft =
                        await getDraftById(
                            draftId,
                            user.id
                        );


                    if (!draft) {

                        Alert.alert(
                            "پیش‌نویس منقضی شده",
                            "این پیش‌نویس دیگر در دسترس نیست."
                        );

                        return;
                    }


                    if (
                        draft.checklistTypeId !==
                        WIRELESS_CHECKLIST_TYPE_ID
                    ) {

                        Alert.alert(
                            "خطا",
                            "این پیش‌نویس مربوط به چک‌لیست وایرلس نیست."
                        );

                        return;
                    }


                    setChecklistData(
    normalizeChecklistData(
        draft.data
    )
);

                    setCurrentDraftId(
                        draft.id
                    );

                } catch (error) {

                    console.error(
                        "Load wireless draft error:",
                        error
                    );

                    Alert.alert(
                        "خطا",
                        error?.message ||
                            "بارگذاری پیش‌نویس وایرلس انجام نشد."
                    );
                }
            };


        loadDraft();

    }, [
        route?.params?.draftId,
        route?.params?.editChecklistId,
        user?.id,
    ]);


    /* =========================================================
       Update Checklist
    ========================================================= */

    const updateChecklistData = useCallback(
    (section, field, value) => {
        setChecklistData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    },
    []
);

const updateChecklistField = useCallback(
    (field, value) => {
        setChecklistData((prev) => ({
            ...prev,
            [field]: value,
        }));
    },
    []
);


/* =========================================================
       Handler
    ========================================================= */


const handleSiteInformationChange = useCallback(
    (field, value) => {
        updateChecklistData(
            "siteInformation",
            field,
            value
        );
    },
    [updateChecklistData]
);

const handleWirelessSiteTypeChange = useCallback(
    (value) => {
        updateChecklistField(
            "wirelessSiteType",
            value
        );
    },
    [updateChecklistField]
);

const handleSerialNumberChange = useCallback(
    (value) => {
        updateChecklistField(
            "serialNumber",
            value
        );
    },
    [updateChecklistField]
);

const handleAssetNumberChange = useCallback(
    (value) => {
        updateChecklistField(
            "assetNumber",
            value
        );
    },
    [updateChecklistField]
);

const handleWirelessBodyConditionChange =
    useCallback(
        (field, value) => {
            updateChecklistData(
                "wirelessBodyCondition",
                field,
                value
            );
        },
        [updateChecklistData]
    );

const handlePowerSupplyConditionChange =
    useCallback(
        (field, value) => {
            updateChecklistData(
                "powerSupplyCondition",
                field,
                value
            );
        },
        [updateChecklistData]
    );

const handlePowerChange = useCallback(
    (field, value) => {
        updateChecklistData(
            "power",
            field,
            value
        );
    },
    [updateChecklistData]
);

const handleVehicleEquipmentChange =
    useCallback(
        (field, value) => {
            updateChecklistData(
                "vehicleEquipment",
                field,
                value
            );
        },
        [updateChecklistData]
    );


    /* =========================================================
       Clear Checklist
    ========================================================= */

    const clearChecklist = () => {

        setChecklistData(
            INITIAL_CHECKLIST_DATA
        );

        setCurrentDraftId(
            null
        );

        setEditingChecklistId(
            null
        );

        setErrors({});
    };


    /* =========================================================
       Final Submit / Update
    ========================================================= */

    const handleSubmit =
        async (
            payload
        ) => {

            const validation =
    validateWirelessChecklist(checklistData);

if (!validation.isValid) {

    console.log(
        "Validation Errors:",
        validation.errors
    );

    setErrors(
        validation.errors
    );

    Alert.alert(
        "خطای اعتبارسنجی",
        "لطفاً اطلاعات چک‌لیست را کامل و صحیح وارد کنید."
    );

    return;
}

setErrors({});

            try {

                let response;


                /*
                    حالت Edit
                */
                if (
                    editingChecklistId
                ) {

                    const updatePayload = {

                        checklistDate:
                            payload?.checklistDate ||
                            checklistData
                                ?.visit
                                ?.date ||
                            null,

                        siteName:
                            payload?.siteName ||
                            checklistData
                                ?.siteInformation
                                ?.site ||
                            "",

                        data:
                            payload?.data ||
                            checklistData,
                    };


                    response =
                        await updateChecklist(
                            editingChecklistId,
                            updatePayload
                        );


                    clearChecklist();


                    navigation.setParams({
                        editChecklistId:
                            undefined,
                    });


                    Alert.alert(
                        "ویرایش موفق",
                        "چک لیست وایرلس با موفقیت ویرایش شد.",
                        [
                            {
                                text: "باشه",

                                onPress: () => {
                                    navigation.goBack();
                                },
                            },
                        ]
                    );


                    return;
                }


                /*
                    حالت ثبت عادی
                */
                response =
                    await createChecklist(
                        payload
                    );


                /*
                    اگر چک‌لیست از Draft آمده،
                    بعد از ثبت نهایی Draft حذف می‌شود.
                */
                if (
                    currentDraftId
                ) {

                    try {

                        if (user?.id) {

                            await deleteDraft(
                                currentDraftId,
                                user.id
                            );

                        }

                    } catch (
                        draftDeleteError
                    ) {

                        console.error(
                            "Delete wireless draft after submit error:",
                            draftDeleteError
                        );
                    }
                }


                clearChecklist();


                Alert.alert(
                    "ثبت موفق",
                    "چک لیست وایرلس با موفقیت ثبت شد."
                );

            } catch (error) {

                console.error(
                    "Wireless checklist submit error:",
                    error
                );


                Alert.alert(
                    "خطا در ثبت",
                    error?.message ||
                        "ثبت چک لیست وایرلس انجام نشد."
                );
            }

        };


    /* =========================================================
       Save Draft
    ========================================================= */

    const handleSaveDraft =
        async (
            data
        ) => {

            const result =
                validateWirelessChecklist(checklistData);


            if(!result.isValid){

                setErrors(result.errors);

                return;
            }

            try {

                if (!user?.id) {

                    Alert.alert(
                        "خطا",
                        "اطلاعات کاربر پیدا نشد."
                    );

                    return;
                }


                const draft =
                    await saveDraft({

                        id:
                            currentDraftId,

                        userId:
                            user.id,

                        checklistTypeId:
                            WIRELESS_CHECKLIST_TYPE_ID,

                        checklistDate:
                            data?.visit?.date ||
                            null,

                        siteName:
                            data
                                ?.siteInformation
                                ?.site ||
                            "",

                        data,

                    });


                setCurrentDraftId(
                    draft.id
                );


                Alert.alert(
                    "ذخیره موفق",

                    draft.isUpdated
                        ? "پیش‌نویس وایرلس با موفقیت به‌روزرسانی شد."
                        : "پیش‌نویس وایرلس با موفقیت ذخیره شد."
                );

            } catch (error) {

                console.error(
                    "Save wireless draft error:",
                    error
                );


                Alert.alert(
                    "خطا",
                    error?.message ||
                        "ذخیره پیش‌نویس وایرلس انجام نشد."
                );
            }

        };


    /* =========================================================
       Render
    ========================================================= */

    return (


        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
            Platform.OS === "ios"
                ? "padding"
                : "height"
        }
    >

        <ScrollView

            style={
                styles.scrollView
            }

            contentContainerStyle={
                styles.container
            }

            keyboardShouldPersistTaps="handled"

            showsVerticalScrollIndicator={
                true
            }
            keyboardDismissMode={
                Platform.OS === "ios"
                    ? "interactive"
                    : "on-drag"
            }

        >

            <Date_Time_Location

                data={
                    checklistData.visit
                }

                onChange={
                    updateChecklistData
                }

                errors={errors}

            />


            <SiteInformation

                data={
                    checklistData.siteInformation
                }

                onChange={handleSiteInformationChange}
            />


            <WirelessSiteType

                value={
                    checklistData
                        .wirelessSiteType
                }

                onChange={handleWirelessSiteTypeChange}

            />


            <SerialNumber

                value={
                    checklistData.serialNumber
                }

                onChange={handleSerialNumberChange}

            />


            <AssetNumber

                value={
                    checklistData.assetNumber
                }

                onChange={handleAssetNumberChange}

            />


            <WirelessBodyCondition

                data={
                    checklistData
                        .wirelessBodyCondition
                }

                onChange={handleWirelessBodyConditionChange}

            />


            <PowerSupplyCondition

                data={
                    checklistData
                        .powerSupplyCondition
                }

                onChange={handlePowerSupplyConditionChange}

            />


            <Power

                data={
                    checklistData.power
                }

                onChange={handlePowerChange}

            />


            <VehicleEquipment

                data={
                    checklistData
                        .vehicleEquipment
                }

                onChange={handleVehicleEquipmentChange}

            />


            <ChecklistActions

                checklistData={
                    checklistData
                }

                checklistType="wireless"

                onSubmit={
                    handleSubmit
                }

                onSaveDraft={
                    handleSaveDraft
                }

                isEditing={!!editingChecklistId}

            />

        </ScrollView>

        </KeyboardAvoidingView>
    );
};


export default WirelessScreen;


const styles = StyleSheet.create({

    scrollView: {

        flex: 1,

    },

    container: {

        padding: 16,

        paddingBottom: 120,

    },

});