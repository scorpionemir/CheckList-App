import React, {
    useState,
    useEffect,
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
import SiteLocation from "../components/CheckList/SiteLocation";
import SiteType from "../components/CheckList/SiteType";
import WirelessAntennaConnectors from "../components/CheckList/WirelessAntennaConnectors";
import AntennaCable from "../components/CheckList/AntennaCable";
import AntennaType from "../components/CheckList/AntennaType";
import TowerTypeAndBase from "../components/CheckList/TowerTypeAndBase";
import TowerInstallationLocation from "../components/CheckList/TowerInstallationLocation";
import TowerHeight from "../components/CheckList/TowerHeight";
import BalancePlateStatus from "../components/CheckList/BalancePlateStatus";
import GuyWireStatus from "../components/CheckList/GuyWireStatus";
import RodStatus from "../components/CheckList/RodStatus";
import TowerBaseStatus from "../components/CheckList/TowerBaseStatus";
import EarthingSystem from "../components/CheckList/EarthingSystem";
import EarthResistance from "../components/CheckList/EarthResistance";
import MastHeadLight from "../components/CheckList/MastHeadLight";
import ChecklistActions from "../components/CheckList/ChecklistActions";

import {
    createChecklist,
    getMyChecklistById,
    updateChecklist,
} from "../services/api";

import {
    getDraftById,
    saveDraft,
    deleteDraft,
} from "../services/localDatabase";

import { useAuth } from "../context/AuthContext";

import { useRoute } from "@react-navigation/native";

import {
    validateAntennaChecklist,
} from "../services/checklistValidation";

import {
    normalizeChecklistData,
} from "../services/normalizeChecklistData";


const ANTENNA_CHECKLIST_TYPE_ID =
    "90286988-53d6-4a65-bd87-f5771fc95960";


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

    siteLocation: {
        source: null,

        gps: {
            latitude: null,
            longitude: null,
        },

        manual: {
            latitude: null,
            longitude: null,
        },
    },

    siteType: null,

    wirelessAntennaConnectors: {
        selectedOptions: [],
        description: "",
    },

    antennaCable: {
        cableType: null,
        length: null,
        description: "",
    },

    antennaType: {
        antennaType: null,
        heights: [],
        description: "",
    },

    tower: {
        towerType: null,
        baseType: null,
        baseDescription: null,
    },

    towerInstallationLocation: null,

    towerHeight: {
        height: null,
        description: "",
    },

    balancePlateStatus: null,

    guyWireStatus: null,

    rodStatus: null,

    towerBaseStatus: null,

    earthingSystem: {
        selectedOption: null,
        description: "",
    },

    earthResistance: {
        selectedOption: null,
        ohmValue: null,
    },

    mastHeadLight: {
        selectedOptions: [],
    },
};


const AntennaScreen = ({
    navigation,
}) => {

    const route =
        useRoute();

    const { user } =
        useAuth();


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

    const [errors,setErrors] = useState({});


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
                    ANTENNA_CHECKLIST_TYPE_ID
                ) {
                    Alert.alert(
                        "خطا",
                        "این چک‌لیست مربوط به بخش آنتن نیست."
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
                    "Load antenna checklist for edit error:",
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
            Draft نباید اطلاعات فرم را overwrite کند.
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
                        ANTENNA_CHECKLIST_TYPE_ID
                    ) {

                        Alert.alert(
                            "خطا",
                            "این پیش‌نویس مربوط به چک‌لیست آنتن نیست."
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
                        "Load draft error:",
                        error
                    );

                    Alert.alert(
                        "خطا",
                        error?.message ||
                            "بارگذاری پیش‌نویس انجام نشد."
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


    const handleVisitChange = useCallback(
    (field, value) => {
        updateChecklistData(
            "visit",
            field,
            value
        );
    },
    [updateChecklistData]
);


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


const handleSiteLocationChange = useCallback(
    (field, value) => {
        updateChecklistData(
            "siteLocation",
            field,
            value
        );
    },
    [updateChecklistData]
);


const handleSiteTypeChange = useCallback(
    (value) => {
        updateChecklistField(
            "siteType",
            value
        );
    },
    [updateChecklistField]
);


const handleWirelessAntennaConnectorsChange =
    useCallback(
        (field, value) => {
            updateChecklistData(
                "wirelessAntennaConnectors",
                field,
                value
            );
        },
        [updateChecklistData]
    );


const handleAntennaCableChange = useCallback(
    (field, value) => {
        updateChecklistData(
            "antennaCable",
            field,
            value
        );
    },
    [updateChecklistData]
);


const handleAntennaTypeChange = useCallback(
    (field, value) => {
        updateChecklistData(
            "antennaType",
            field,
            value
        );
    },
    [updateChecklistData]
);


const handleTowerChange = useCallback(
    (field, value) => {
        updateChecklistData(
            "tower",
            field,
            value
        );
    },
    [updateChecklistData]
);


const handleTowerInstallationLocationChange =
    useCallback(
        (value) => {
            updateChecklistField(
                "towerInstallationLocation",
                value
            );
        },
        [updateChecklistField]
    );


const handleTowerHeightChange = useCallback(
    (field, value) => {
        updateChecklistData(
            "towerHeight",
            field,
            value
        );
    },
    [updateChecklistData]
);


const handleBalancePlateStatusChange =
    useCallback(
        (value) => {
            updateChecklistField(
                "balancePlateStatus",
                value
            );
        },
        [updateChecklistField]
    );


const handleGuyWireStatusChange = useCallback(
    (value) => {
        updateChecklistField(
            "guyWireStatus",
            value
        );
    },
    [updateChecklistField]
);


const handleRodStatusChange = useCallback(
    (value) => {
        updateChecklistField(
            "rodStatus",
            value
        );
    },
    [updateChecklistField]
);


const handleTowerBaseStatusChange =
    useCallback(
        (value) => {
            updateChecklistField(
                "towerBaseStatus",
                value
            );
        },
        [updateChecklistField]
    );


const handleEarthingSystemChange =
    useCallback(
        (field, value) => {
            updateChecklistData(
                "earthingSystem",
                field,
                value
            );
        },
        [updateChecklistData]
    );


const handleEarthResistanceChange =
    useCallback(
        (field, value) => {
            updateChecklistData(
                "earthResistance",
                field,
                value
            );
        },
        [updateChecklistData]
    );


const handleMastHeadLightChange =
    useCallback(
        (field, value) => {
            updateChecklistData(
                "mastHeadLight",
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
        async (payload) => {

            const validation = validateAntennaChecklist(checklistData);

if (!validation.isValid) {

    setErrors(validation.errors);

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
                            checklistData?.visit?.date ||
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


                    /*
                        پارامتر Edit را از Route
                        حذف می‌کنیم.
                    */
                    navigation.setParams({
                        editChecklistId:
                            undefined,
                    });


                    Alert.alert(
                        "ویرایش موفق",
                        "چک لیست آنتن با موفقیت ویرایش شد.",
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
                    بعد از ثبت نهایی Draft محلی حذف می‌شود.
                */
                if (
                    currentDraftId &&
                    user?.id
                ) {

                    try {

                        await deleteDraft(
                            currentDraftId,
                            user.id
                        );

                    } catch (
                        deleteError
                    ) {

                        console.error(
                            "Could not delete submitted draft:",
                            deleteError
                        );
                    }
                }


                clearChecklist();


                Alert.alert(
                    "ثبت موفق",
                    "چک لیست آنتن با موفقیت ثبت شد."
                );

            } catch (error) {

                console.error(
                    "Antenna checklist submit error:",
                    error
                );


                Alert.alert(
                    "خطا در ثبت",
                    error?.message ||
                        "ثبت چک لیست آنتن انجام نشد."
                );
            }
        };


    /* =========================================================
       Save Draft
    ========================================================= */

    const handleSaveDraft =
        async (data) => {

            const result =
                validateAntennaChecklist(checklistData);

            if (!result.isValid) {

                setErrors(result.errors);

                Alert.alert(
                    "خطای اعتبارسنجی",
                    "لطفاً اطلاعات چک‌لیست را کامل و صحیح وارد کنید."
                );

                return;
            }

            setErrors({});

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
                            ANTENNA_CHECKLIST_TYPE_ID,

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
                        ? "پیش‌نویس با موفقیت به‌روزرسانی شد."
                        : "پیش‌نویس چک‌لیست با موفقیت ذخیره شد."
                );

            } catch (error) {

                console.error(
                    "Save antenna draft error:",
                    error
                );


                Alert.alert(
                    "خطا",
                    error?.message ||
                        "ذخیره پیش‌نویس انجام نشد."
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


            <SiteLocation

                data={
                    checklistData.siteLocation
                }

                onChange={handleSiteLocationChange}

            />


            <SiteType

                value={
                    checklistData.siteType
                }

                onChange={handleSiteTypeChange}

            />


            <WirelessAntennaConnectors

                data={
                    checklistData
                        .wirelessAntennaConnectors
                }

                onChange={handleWirelessAntennaConnectorsChange}

            />


            <AntennaCable

                data={
                    checklistData.antennaCable
                }

                onChange={handleAntennaCableChange}

            />


            <AntennaType

                data={
                    checklistData.antennaType
                }

                onChange={handleAntennaTypeChange}

            />


            <TowerTypeAndBase

                data={
                    checklistData.tower
                }

                onChange={handleTowerChange}

            />


            <TowerInstallationLocation

                value={
                    checklistData
                        .towerInstallationLocation
                }

                onChange={handleTowerInstallationLocationChange}

            />


            <TowerHeight

                data={
                    checklistData.towerHeight
                }

                onChange={handleTowerHeightChange}

            />


            <BalancePlateStatus

                value={
                    checklistData
                        .balancePlateStatus
                }

                onChange={handleBalancePlateStatusChange}

            />


            <GuyWireStatus

                value={
                    checklistData.guyWireStatus
                }

                onChange={handleGuyWireStatusChange}

            />


            <RodStatus

                value={
                    checklistData.rodStatus
                }

                onChange={handleRodStatusChange}

            />


            <TowerBaseStatus

                value={
                    checklistData.towerBaseStatus
                }

                onChange={handleTowerBaseStatusChange}

            />


            <EarthingSystem

                data={
                    checklistData.earthingSystem
                }

                onChange={handleEarthingSystemChange}

            />


            <EarthResistance

                data={
                    checklistData.earthResistance
                }

                onChange={handleEarthResistanceChange}

            />


            <MastHeadLight

                data={
                    checklistData.mastHeadLight
                }

                onChange={handleMastHeadLightChange}

            />


            <ChecklistActions

                checklistData={
                    checklistData
                }

                checklistType="antenna"

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


export default AntennaScreen;


const styles = StyleSheet.create({

    scrollView: {
        flex: 1,
    },

    container: {
        padding: 16,
        paddingBottom: 120,
    },

});