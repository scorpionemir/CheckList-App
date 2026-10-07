import React from "react";

import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    validateAntennaChecklist,
    validateWirelessChecklist,
} from "../../services/checklistValidation";

import {
    prepareAntennaChecklistPayload,
    prepareWirelessChecklistPayload,
} from "../../services/checklistPayload";


const ChecklistActions = ({
    checklistData,
    onSubmit,
    onSaveDraft,
    checklistType,
    isEditing = false,
}) => {

    const getChecklistType = () => {
        if (checklistType) {
            return checklistType;
        }

        if (
            checklistData &&
            Object.prototype.hasOwnProperty.call(
                checklistData,
                "wirelessSiteType"
            )
        ) {
            return "wireless";
        }

        return "antenna";
    };


    const validateChecklist = () => {
        const type = getChecklistType();

        if (type === "wireless") {
            return validateWirelessChecklist(
                checklistData
            );
        }

        return validateAntennaChecklist(
            checklistData
        );
    };


    const preparePayload = () => {
        const type = getChecklistType();

        if (type === "wireless") {
            return prepareWirelessChecklistPayload(
                checklistData
            );
        }

        return prepareAntennaChecklistPayload(
            checklistData
        );
    };


    const showValidationErrors = (errors) => {
        const messages = Object.values(errors || {});

        if (messages.length === 0) {
            return;
        }

        const message = messages.join("\n");

        Alert.alert(
            "اطلاعات ناقص",
            message
        );
    };


    const handleSubmit = () => {
        const validation =
            validateChecklist();

        if (!validation.isValid) {
            showValidationErrors(
                validation.errors
            );

            return;
        }

        const payload =
            preparePayload();

        Alert.alert(
            "ثبت چک لیست",
            "آیا از ثبت نهایی چک لیست اطمینان دارید؟",
            [
                {
                    text: "انصراف",
                    style: "cancel",
                },

                {
                    text: "ثبت نهایی",

                    onPress: () => {
                        console.log(
                            "Final checklist payload:",
                            JSON.stringify(
                                payload,
                                null,
                                2
                            )
                        );

                        if (onSubmit) {
                            onSubmit(payload);
                        }
                    },
                },
            ]
        );
    };


    const handleSaveDraft = () => {
        Alert.alert(
            "ذخیره پیش نویس",
            "آیا می‌خواهید اطلاعات فعلی به صورت پیش نویس ذخیره شود؟",
            [
                {
                    text: "انصراف",
                    style: "cancel",
                },

                {
                    text: "ذخیره",

                    onPress: () => {
                        if (onSaveDraft) {
                            onSaveDraft(
                                checklistData
                            );
                        }
                    },
                },
            ]
        );
    };


    return (
        <View style={styles.container}>

            <TouchableOpacity
                style={[
                    styles.button,
                    styles.submitButton,
                ]}
                onPress={handleSubmit}
                activeOpacity={0.7}
            >
                <Text
                    style={styles.submitText}
                >
                    ثبت نهایی
                </Text>
            </TouchableOpacity>


            {!isEditing && (
            <TouchableOpacity
                style={[
                    styles.button,
                    styles.draftButton,
                ]}
                onPress={handleSaveDraft}
                activeOpacity={0.7}
            >
                <Text style={styles.draftText}>
                    ذخیره پیش نویس
                </Text>
            </TouchableOpacity>
        )}

        </View>
    );
};


export default React.memo(ChecklistActions);

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginTop: 10,
        marginBottom: 30,
        gap: 12,
    },

    button: {
        width: "100%",
        minHeight: 52,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
    },

    submitButton: {
        backgroundColor: "#c5882d",
        borderColor: "#c5882d",
    },

    submitText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "bold",
    },

    draftButton: {
        backgroundColor: "#FFFFFF",
        borderColor: "#c5882d",
    },

    draftText: {
        color: "#c5882d",
        fontSize: 17,
        fontWeight: "bold",
    },
});