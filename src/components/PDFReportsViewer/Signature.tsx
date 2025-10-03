import React from "react";
import { Link, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingBottom: 20,
    paddingLeft: 6,
    paddingTop: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
    borderBottomStyle: "solid",
  },
  textLeftCol: {
    alignSelf: "flex-start",
    justifySelf: "flex-start",
  },
});

interface MyComponentProps {
  paddingLeft?: number;
  paddingBottom?: number;
  prefix?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  extraNote?: string;
  fareWell?: string;
  debug?: boolean;
  signature?: string; //string base64 data URI
}

const Signature: React.FC<MyComponentProps> = ({
  paddingLeft = 6,
  paddingBottom,
  prefix,
  debug,
  firstName,
  lastName,
  phoneNumber,
  email,
  extraNote,
  fareWell,
  signature,
}) => {
  prefix = prefix ? prefix.trim() : "";

  let Signature = "";
  let fullName = "";
  let completeName = "";
  if (!firstName && !lastName) {
    fullName = "Your referring provider";
  } else {
    fullName = firstName + " " + lastName;
  }
  completeName = fullName;
  if (prefix) {
    completeName = `${prefix} ${fullName}`;
  }
  Signature = `${typeof fareWell === undefined || fareWell === "undefined" ? "Sincerely," : fareWell ?? "Sincerely,"}\n\n${completeName}`;
  if (phoneNumber) {
    Signature += `\n${phoneNumber}`;
  }
  if (email) {
    Signature += `\n${email}`;
  }
  if (extraNote) {
    Signature += `\n\n${extraNote}`;
  }

  return (
    <View style={[styles.container, { paddingLeft: paddingLeft, paddingBottom: paddingBottom }]} debug={debug}>
      <Text style={styles.textLeftCol}>{`${Signature}`}</Text>
      {signature && (
        <Image
          src={signature}
          style={{
            padding: 4,
            paddingTop: 6,
            height: 64,
            width: "auto",
            objectFit: "contain", // or 'scale-down'
          }}
        />
      )}
    </View>
  );
};

export default Signature;
