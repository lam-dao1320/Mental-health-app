import { useUserContext } from "@/context/authContext";
import { getUserByEmail, updateUser } from "@/lib/user_crud";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import icon1 from "../../../assets/images/icon/avatar1.png";
import icon2 from "../../../assets/images/icon/avatar2.png";
import icon3 from "../../../assets/images/icon/avatar3.png";
import icon4 from "../../../assets/images/icon/avatar4.png";
import icon5 from "../../../assets/images/icon/avatar5.png";

const Colors = {
  bg: "#F9F9FB",
  card: "#FFFFFF",
  text: "#1D1D1F",
  sub: "#6B7280",
  border: "rgba(0,0,0,0.06)",
  mint: "#ACD1C9",
  divider: "rgba(0,0,0,0.08)",
};

const MAX_WIDTH = 560;

export default function PersonalInfoScreen() {
  const { profile, setProfile } = useUserContext();
  const router = useRouter();
  const maxWidth = Math.min(Dimensions.get("window").width - 32, 560);

  // Mock data with editable state
  const [email, setEmail] = useState(profile?.email);

  const [firstName,setFirstName] = useState(profile?.first_name);
  const [lastName, setLastName] = useState(profile?.last_name);
  const [country, setCountry] = useState(profile?.country);
  const [phone, setPhone] = useState(profile?.phone);
  const [birthDate, setBirthDate] = useState<any>(profile?.birth_date);

  // Icon selection state
  const [selectedIcon, setSelectedIcon] = useState(profile?.icon_name ?? "avatar1");
  // const iconUris = [
  //   Image.resolveAssetSource(icon1).uri,
  //   Image.resolveAssetSource(icon2).uri,
  //   Image.resolveAssetSource(icon3).uri,
  //   Image.resolveAssetSource(icon4).uri,
  //   Image.resolveAssetSource(icon5).uri,
  // ];
  const icons = [
    { key: "avatar1", src: icon1 },
    { key: "avatar2", src: icon2 },
    { key: "avatar3", src: icon3 },
    { key: "avatar4", src: icon4 },
    { key: "avatar5", src: icon5 },
  ];
  // console.log("Selected icon URL:", selectedIcon);


  const [error, setError] = useState<string | null>(null);

  // console.log("Profile data in PersonalInfo screen:", profile);
  
  const handleSave = async () => {
    setError(null);

    if (!firstName || !lastName) {
      setError("Information is required");
      return;
    }

    let birthDateCheck = null;

    if (birthDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthDate)) {
        setError("Invalid date format (must be YYYY-MM-DD)");
        return;
      }
      const timestamp = Date.parse(birthDate);
      if (isNaN(timestamp)) {
        setError(`Could not parse date: ${birthDate}`);
        return;
      }
      const dateCheck = new Date(timestamp);
      if (dateCheck > new Date()) {
        setError("Birth date cannot be in the future.");
        return;
      }

      birthDateCheck = dateCheck;
    }

    let updatedProfile = {
      first_name: firstName ?? "",
      last_name: lastName ?? "",
      email: email ?? "",
      phone: phone ?? "",
      birth_date: birthDateCheck ?? null,
      country: country ?? "",
      depression: profile?.depression ?? null,
      anxiety: profile?.anxiety ?? null,
      overall: profile?.overall ?? null,
      checked_in_at: profile?.checked_in_at ?? null,
      icon_name: selectedIcon ?? profile?.icon_name ?? "avatar1",
    }

    // console.log("Update profile: ", updatedProfile);
    
    try {
      await updateUser(updatedProfile);
      if (email) {
        const profileData = await getUserByEmail(email);
        setProfile(profileData);
      }
      router.back();
    } catch (err: any) {
       setError(err instanceof Error ? err.message : "Saving changes failed")
    } 
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F4F8F7" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.bg }}
        contentContainerStyle={{
          flexGrow: 1, // ensures container takes full height
          alignItems: "center", // horizontal center
          justifyContent: "center", // vertical center
          padding: 16,
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: "100%", maxWidth: MAX_WIDTH }}>
          <Text style={styles.title}>Personal Info</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Icon Selection */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconLabel}>Choose your avatar</Text>
          <View style={styles.iconRow}>
            {icons.map((icon) => {
              const isSelected = selectedIcon === icon.key;
              return (
                <Pressable
                  key={icon.key}
                  onPress={() => setSelectedIcon(icon.key)}
                  style={[styles.iconWrapper, isSelected && styles.iconSelected]}
                >
                  <Image source={icon.src} style={styles.iconImage} />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Form */}
        <View
          style={[
            styles.card,
            styles.shadow,
            { width: "100%", maxWidth: MAX_WIDTH },
          ]}
        >
          <Field label="First name">
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor="rgba(0,0,0,0.35)"
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </Field>
          <Field label="Last name">
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              placeholderTextColor="rgba(0,0,0,0.35)"
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </Field>
          <Field label="Birth Date">
            <TextInput
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="rgba(0,0,0,0.35)"
              style={styles.input}
              autoCapitalize="none"
              returnKeyType="next"
            />
          </Field>

          <Divider />

          <Field label="Email">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor="rgba(0,0,0,0.35)"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              editable={false}
            />
          </Field>

          <Field label="Phone">
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="10 characters"
              placeholderTextColor="rgba(0,0,0,0.35)"
              style={styles.input}
              keyboardType="numeric"
              returnKeyType="next"
            />
          </Field>
          <Field label="Country">
            <TextInput
              value={country}
              onChangeText={setCountry}
              placeholder="e.g., United States"
              placeholderTextColor="rgba(0,0,0,0.35)"
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </Field>
        </View>

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.95 }]}
          onPress={handleSave}
          hitSlop={8}
        >
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.saveText}>Save changes</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32, gap: 16 },
  titleWrap: { marginTop: 6, marginBottom: 2 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },

  card: {
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  fieldRow: { paddingVertical: 10 },
  fieldLabel: {
    fontSize: 14,
    color: Colors.sub,
    marginBottom: 6,
    fontFamily: "Noto Sans HK",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
    fontFamily: "Noto Sans HK",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },

  // Medium-width, centered Save button
  saveBtn: {
    minWidth: 180,
    alignSelf: "center",
    backgroundColor: Colors.mint,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    fontFamily: "Noto Sans HK",
  },
  errorText: {
        color: "#F49790",
        marginBottom: 15,
        textAlign: "center",
        fontFamily: "Noto Sans HK",
    },
  iconContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  iconLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "600",
    marginBottom: 10,
    fontFamily: "Noto Sans HK",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconSelected: {
    borderColor: Colors.mint,
    borderWidth: 3,
  },
  iconImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: "cover",
  },
});
