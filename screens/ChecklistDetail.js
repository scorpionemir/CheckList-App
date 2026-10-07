import React, { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { ApiError, getMyChecklistById } from "../services/api";

import { useAuth } from "../context/AuthContext";


const ANTENNA_CHECKLIST_TYPE_ID =
  "90286988-53d6-4a65-bd87-f5771fc95960";

const WIRELESS_CHECKLIST_TYPE_ID =
  "513e9202-7fb3-47a3-9f5b-ab8e1beb3ca0";


const ChecklistDetail = ({ route, navigation }) => {

  const { checklistId } = route?.params || {};

  const { user } = useAuth();

  const [checklist, setChecklist] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);


  const loadChecklist = useCallback(async () => {

    if (!checklistId) {
      setLoading(false);
      return;
    }

    try {

      setLoading(true);

      const result = await getMyChecklistById(checklistId);

      setChecklist(result?.checklist || result);

    } catch (error) {

      console.error("Load checklist detail error:", error);

      if (error instanceof ApiError) {

        Alert.alert(
          "خطا",
          error.message || "دریافت اطلاعات چک‌لیست انجام نشد."
        );

      } else {

        Alert.alert(
          "خطا",
          "دریافت اطلاعات چک‌لیست انجام نشد."
        );
      }

    } finally {

      setLoading(false);

    }

  }, [checklistId]);


  useFocusEffect(
    useCallback(() => {

      loadChecklist();

    }, [loadChecklist])
  );


  const handleRefresh = async () => {

    try {

      setRefreshing(true);

      await loadChecklist();

    } finally {

      setRefreshing(false);

    }

  };


  /*
   * ==============================
   * دکمه ویرایش
   * ==============================
   */

  const handleEdit = () => {

    if (!checklist?.id) {
      return;
    }


    /*
     * اگر مدیر اجازه ویرایش نداده باشد
     */

    if (!checklist.edit_allowed) {

      Alert.alert(
        "ویرایش مجاز نیست",
        "برای این چک‌لیست هنوز مجوز ویرایش صادر نشده است."
      );

      return;
    }


    /*
     * چک‌لیست آنتن
     */

    if (
      checklist.checklist_type_id ===
      ANTENNA_CHECKLIST_TYPE_ID
    ) {

      navigation.navigate("CheckList", {
        screen: "Antenna",

        params: {
          editChecklistId: checklist.id,
        },
      });

      return;
    }


    /*
     * چک‌لیست وایرلس
     */

    if (
      checklist.checklist_type_id ===
      WIRELESS_CHECKLIST_TYPE_ID
    ) {

      navigation.navigate("CheckList", {
        screen: "Wireless",

        params: {
          editChecklistId: checklist.id,
        },
      });

      return;
    }


    /*
     * اگر نوع چک‌لیست ناشناخته باشد
     */

    Alert.alert(
      "خطا",
      "نوع این چک‌لیست برای ویرایش مشخص نیست."
    );

  };


  /*
   * ==============================
   * نمایش اطلاعات به صورت بازگشتی
   * ==============================
   */

  const renderValue = (value, level = 0) => {

    if (value === null || value === undefined) {
      return null;
    }


    /*
     * مقدارهای ساده
     */

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {

      return (
        <View
          style={[
            styles.valueRow,
            {
              paddingRight: level * 12,
            },
          ]}
        >

          <Text style={styles.valueText}>

            {typeof value === "boolean"
              ? value
                ? "بله"
                : "خیر"
              : String(value)}

          </Text>

        </View>
      );
    }


    /*
     * آرایه
     */

    if (Array.isArray(value)) {

      return (
        <View
          style={[
            styles.nestedContainer,
            {
              marginRight: level * 8,
            },
          ]}
        >

          {value.length === 0 ? (

            <Text style={styles.emptyText}>
              موردی ثبت نشده است
            </Text>

          ) : (

            value.map((item, index) => (

              <View
                key={index}
                style={styles.arrayItem}
              >

                <Text style={styles.arrayIndex}>
                  مورد {index + 1}
                </Text>

                {renderValue(item, level + 1)}

              </View>

            ))

          )}

        </View>
      );
    }


    /*
     * Object
     */

    if (typeof value === "object") {

      return (
        <View
          style={[
            styles.nestedContainer,
            {
              marginRight: level * 8,
            },
          ]}
        >

          {Object.entries(value).map(
            ([key, itemValue]) => (

              <View
                key={key}
                style={styles.objectItem}
              >

                <Text style={styles.objectKey}>
                  {key}
                </Text>

                {renderValue(
                  itemValue,
                  level + 1
                )}

              </View>

            )
          )}

        </View>
      );
    }


    return null;
  };


  if (loading) {

    return (
      <View style={styles.centerContainer}>

        <ActivityIndicator
          size="large"
          color="#1976d2"
        />

        <Text style={styles.loadingText}>
          در حال دریافت اطلاعات...
        </Text>

      </View>
    );

  }


  if (!checklist) {

    return (
      <View style={styles.centerContainer}>

        <Text style={styles.errorText}>
          اطلاعات چک‌لیست پیدا نشد.
        </Text>

      </View>
    );

  }


  return (
    <View style={styles.container}>

      <ScrollView
        contentContainerStyle={styles.contentContainer}

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >

        {/* عنوان */}

        <Text style={styles.title}>
          جزئیات چک‌لیست
        </Text>


        {/* اطلاعات اصلی */}

        <View style={styles.infoCard}>

          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              تاریخ:
            </Text>

            <Text style={styles.infoValue}>
              {checklist.checklist_date || "-"}
            </Text>

          </View>


          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              محل:
            </Text>

            <Text style={styles.infoValue}>
              {checklist.site_name || "-"}
            </Text>

          </View>


          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              وضعیت:
            </Text>

            <Text style={styles.infoValue}>
              {checklist.status === "submitted"
                ? "ثبت شده"
                : checklist.status || "-"}
            </Text>

          </View>


          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              وضعیت ویرایش:
            </Text>

            <Text
              style={[
                styles.infoValue,

                checklist.edit_allowed
                  ? styles.editAllowed
                  : styles.editLocked,
              ]}
            >

              {checklist.edit_allowed
                ? "مجوز ویرایش فعال است"
                : "ویرایش قفل است"}

            </Text>

          </View>

        </View>


        {/* ========================= */}
        {/* دکمه ویرایش */}
        {/* ========================= */}

        {checklist.edit_allowed && (

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.8}
            onPress={handleEdit}
          >

            <Text style={styles.editButtonText}>
              ویرایش چک‌لیست
            </Text>

          </TouchableOpacity>

        )}


        {/* ========================= */}
        {/* اطلاعات چک‌لیست */}
        {/* ========================= */}

        <View style={styles.dataCard}>

          <Text style={styles.dataTitle}>
            اطلاعات ثبت شده
          </Text>

          {renderValue(checklist.data)}

        </View>

      </ScrollView>

    </View>
  );
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },


  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },


  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },


  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#555",
  },


  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
  },


  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#222",
  },


  infoCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },


  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },


  infoLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },


  infoValue: {
    fontSize: 15,
    color: "#555",
    textAlign: "left",
    flex: 1,
    marginRight: 12,
  },


  editAllowed: {
    color: "#1976d2",
    fontWeight: "bold",
  },


  editLocked: {
    color: "#777",
  },


  /*
   * ==============================
   * دکمه ویرایش
   * ==============================
   */

  editButton: {
    backgroundColor: "#1976d2",
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 16,
    alignItems: "center",
  },


  editButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },


  /*
   * ==============================
   * اطلاعات
   * ==============================
   */

  dataCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 10,
    padding: 14,
  },


  dataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 14,
    color: "#222",
  },


  nestedContainer: {
    marginTop: 4,
  },


  objectItem: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },


  objectKey: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    marginBottom: 5,
  },


  valueRow: {
    paddingVertical: 4,
  },


  valueText: {
    fontSize: 14,
    color: "#555",
    textAlign: "right",
  },


  arrayItem: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },


  arrayIndex: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1976d2",
    textAlign: "right",
    marginBottom: 5,
  },


  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    paddingVertical: 10,
  },

});


export default ChecklistDetail;