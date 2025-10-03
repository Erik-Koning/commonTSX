import React from "react";
import { Link, Text, View, StyleSheet, Rect, Svg } from "@react-pdf/renderer";
import { formatPhoneNumberAmerica, hexToRgb } from '../../utils/stringManipulation';

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between", // Adjusts children to be spaced out
    flexWrap: "wrap", // Enable text wrapping
  },
  flexRow: {
    flexDirection: "row",
  },
  titleLeft: {
    fontSize: 20,
    textDecorationColor: "black",
    fontWeight: "semibold",
    alignSelf: "flex-start",
    paddingBottom: 2,
    flexWrap: "wrap", // Enable text wrapping
  },
  titleRight: {
    fontSize: 18,
    textDecorationColor: "black",
    fontWeight: "normal",
    alignSelf: "flex-end",
    paddingBottom: 2,
    flexWrap: "wrap", // Enable text wrapping
  },
  textLeftCol: {
    flexDirection: "column",
    flexGrow: 1,
    textAlign: "left",
  },
  textRightCol: {
    flexDirection: "column",
    flexGrow: 1,
    textAlign: "right",
  },
  text: {
    fontWeight: "medium", // Light font weight for static text
  },
  variableText: {
    fontWeight: "semibold", // Semi-bold font weight for variable text
  },

  borderBox: {
    height: "100%",
    paddingHorizontal: 10,
    borderColor: "black",
    borderStyle: "solid",
    borderWidth: "3px",
    borderRadius: 8,
    padding: 12,
    alignSelf: "flex-end",
  },

  link: {
    fontSize: 10,
    color: "black",
    textDecoration: "none",
    alignSelf: "flex-end",
  },
});

interface MyComponentProps {
  patientName: string;
  patientDOB: string;
  subject: string;
  content?: Record<string, any>;
  officeFields?: Record<string, any>;
  ownerFields?: Record<string, any>;
}

const Sender: React.FC<MyComponentProps> = ({ patientName, patientDOB, subject, officeFields, ownerFields }) => {
  return (
    <View style={{ width: "100%" }}>
      <View style={[styles.container, { alignItems: "center", paddingTop: 15 }]}>
        <View style={styles.textLeftCol}>
          <Text style={styles.text}>{officeFields?.addressL1}</Text>
          {officeFields?.addressL2 && <Text style={styles.text}>{officeFields?.addressL2}</Text>}
          <Text style={styles.text}>{`${officeFields?.addressCity}, ${officeFields?.addressState}, ${officeFields?.addressPostal || ""}`}</Text>
          <Text style={styles.text}>{`Phone: ${formatPhoneNumberAmerica(officeFields?.phone ?? "")}`}</Text>
          {officeFields?.Fax && <Text style={styles.text}>{`Fax: ${officeFields.phone}`}</Text>}
        </View>
      </View>
    </View>
  );
};

export default Sender;
