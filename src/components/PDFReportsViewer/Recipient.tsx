import React from "react";
import { Link, Text, View, StyleSheet, Rect, Svg } from "@react-pdf/renderer";
import { formatPhoneNumberAmerica, hexToRgb } from '../../utils/stringManipulation';
import { getFirstValidKeyValue } from '../../utils/objectManipulation';
import { getStringDateFormatFromDate } from "../../utils/dateManipulation";

const styles = StyleSheet.create({
  dateContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between", // Adjusts children to be spaced out
    flexWrap: "wrap", // Enable text wrapping
    paddingTop: 14,
  },
  container: {
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between", // Adjusts children to be spaced out
    flexWrap: "wrap", // Enable text wrapping
    width: "100%",
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
  regardingValue: string;
  content?: Record<string, any>;
  officeFields?: Record<string, any>;
  ownerFields?: Record<string, any>;
  recipientFields?: Record<string, any>;
  lastEdited?: Date;
  debug?: boolean;
}

const Recipient: React.FC<MyComponentProps> = ({
  patientName,
  patientDOB,
  regardingValue,
  content,
  officeFields,
  ownerFields,
  recipientFields,
  lastEdited,
  debug = false,
}) => {
  let ToField = "";
  let toRecipient = getFirstValidKeyValue(content, ["recipientName", "toRecipient", "physicianName"], undefined);
  let toAddress = getFirstValidKeyValue(
    content,
    ["physicianContactInformation", "contactInformation", "To", "to", "TO", "toAddress", "ToAddress", ""],
    undefined
  );
  if (toAddress) {
    ToField = "To: " + toAddress;
  }
  let email = getFirstValidKeyValue(content, ["newDentistEmail", "email"], undefined);
  if (email) {
    ToField += "\nEmail:" + email;
  }
  let fax = getFirstValidKeyValue(content, ["newDentistFax", "fax"], undefined);
  if (fax) {
    ToField += "\nFax:" + fax;
  }

  return (
    <View style={{ width: "100%", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
      <View style={[styles.container, { alignItems: "center" }]} debug={debug}>
        <View style={styles.textLeftCol} debug={debug}>
          <Text style={[styles.text, { paddingBottom: 10 }]}>{`${
            lastEdited
              ? getStringDateFormatFromDate(lastEdited, officeFields?.dateFormat)
              : getStringDateFormatFromDate(new Date(), officeFields?.dateFormat)
          }`}</Text>
          {(toRecipient || toAddress) && <Text style={styles.text} debug={debug}>{`To: ${toRecipient}`}</Text>}
          {toAddress && <Text style={styles.text}>{toAddress}</Text>}
          {recipientFields?.email && <Text style={styles.text}>{`Email: ${recipientFields?.email}`}</Text>}
          {recipientFields?.phone && <Text style={styles.text}>{`Phone: ${formatPhoneNumberAmerica(recipientFields?.phone ?? "")}`}</Text>}
          {recipientFields?.Fax && <Text style={styles.text}>{`Fax: ${recipientFields.phone}`}</Text>}
        </View>
        <View style={[styles.textRightCol, { flexDirection: "row", justifyContent: "flex-end" }]}>
          <View style={[styles.borderBox, { alignItems: "flex-start" }]}>
            <View style={[styles.flexRow, { justifyContent: "center" }]}>
              <Text style={[styles.text, { paddingRight: "2px" }]}>{"Patient: "}</Text>
              <Text style={styles.variableText}>{patientName}</Text>
            </View>
            <View style={[styles.flexRow, { justifyContent: "center" }]}>
              <Text style={[styles.text, { paddingRight: "2px" }]}>{"Patient DOB: "}</Text>
              <Text style={styles.variableText}>{patientDOB}</Text>
            </View>
            <View style={[styles.flexRow, { justifyContent: "center" }]}>
              <Text style={[styles.text, { paddingRight: "2px" }]}>{"Re: "}</Text>
              <Text style={styles.variableText}>{regardingValue}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Recipient;
