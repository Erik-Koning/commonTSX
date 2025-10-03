import { formatPhoneNumberAmerica, hexToRgb } from '../../utils/stringManipulation';
import { rgbToHex } from "@mui/system";
import { Image, Rect, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center", // Adjusts children to be spaced out
    flexWrap: "wrap", // Enable text wrapping
  },
  colContainer: {
    paddingTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Adjusts children to be spaced out
    flexWrap: "wrap", // Enable text wrapping
    width: "66%",
  },
  colLeft: {
    width: "50%",
    paddingBottom: 2,
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center",
    flexWrap: "wrap", // Enable text wrapping
  },
  colRight: {
    width: "50%",
    paddingBottom: 2,
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center",
    flexWrap: "wrap", // Enable text wrapping
  },
  text: {
    justifyContent: "center",
    flexWrap: "wrap", // Enable text wrapping
  },
  faintText: {
    fontSize: 7,
    color: "#777777",
  },
});

interface MyComponentProps {
  name?: string;
  address?: string;
  phone?: string;
  fax?: string;
  email?: string;
  color?: string;
  logoSVG?: string;
  encryptedFormId?: string;
}

const Footer: React.FC<MyComponentProps> = ({ name, address, phone, fax, email, color, logoSVG, encryptedFormId }) => {
  const rootStyle = window.getComputedStyle(document.documentElement);
  const darkBlue = rootStyle.getPropertyValue("--darkBlue").trim();

  return (
    <View>
      <View style={[styles.container, { marginBottom: 10 }]}>
        <Svg width="100%" height="5" viewBox="0 0 1000 5">
          <Rect x="0" y="0" rx="0px" ry="0px" width="100%" height="5" fill={hexToRgb(color ?? "#3A2CAD")} />
        </Svg>
        <View style={styles.colContainer}>
          <View style={styles.colLeft}>
            <Text style={[styles.text, { fontWeight: "bold" }]}>{name}</Text>
            <Text style={styles.text}>{address}</Text>
          </View>
          <View style={styles.colRight}>
            <Text style={styles.text}>{`Phone: ${formatPhoneNumberAmerica(phone ?? "")}`}</Text>
            {fax && <Text style={styles.text}>{`Fax:  ${fax}`}</Text>}
            {email && <Text style={styles.text}>{`E-mail: ${email}`}</Text>}
          </View>
        </View>
      </View>
      <View style={[styles.container]}>
        <View style={{ flex: 1, alignItems: "flex-start", width: "33%", paddingBottom: "10px" }}>
          <Text style={styles.faintText}>{encryptedFormId}</Text>
        </View>
        <View style={{ flex: 2, flexDirection: "row", justifyContent: "center", alignItems: "center", width: "34%" }}>
          <Text style={[styles.text, { flexWrap: "nowrap", fontSize: 7, color: hexToRgb(darkBlue) }]}>Generated securely with</Text>
          {logoSVG && <Image source={logoSVG} style={{ width: 60, height: 28, marginLeft: "5px" }} />}
        </View>
        <View style={{ flex: 1, alignItems: "flex-end", width: "33%", paddingBottom: "10px" }}>
          <Text style={styles.faintText} render={({ totalPages }) => `Total pages: ${totalPages}`} fixed />
        </View>
      </View>
    </View>
  );
};

export default Footer;
