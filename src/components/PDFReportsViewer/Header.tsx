"use client";

import React, { useEffect, useState } from "react";
import { Link, Text, View, StyleSheet, Rect, Svg, Image } from "@react-pdf/renderer";
import { formatPhoneNumberAmerica, hexToRgb } from '../../utils/stringManipulation';
import { getFileExtension } from '../../utils/fileParsing';
import { svgToDataUri } from '../../utils/imageFormats';
import { isValidImageUrl } from '../../lib/validations/validations';

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
    flexWrap: "wrap", // Enable text wrapping
  },
  logoContainer: {
    // Specify a fixed size or max size for the container
    //overflow: "hidden", // optional if you'd like to clip any overflow
    // width: "auto" is implicit in react-pdf (no explicit width set)
    height: 32,
    padding: 0,
    marginVertical: 2,
    // If you only want a certain dimension, you can do:
    // width: 80,
    // height: "auto",
    // overflow: "hidden", // Not always necessary, but can help if you want to clip overflow
  },
  logoLeft: {
    // Setting `height: "100%"` ensures the image height matches the container
    // Then setting `width: "auto"` keeps the aspect ratio so there's no distortion
    height: "100%",
    width: "auto",
    // objectFit: "contain" will ensure it scales proportionally within the container
    objectFit: "scale-down",
  },
  titleRight: {
    fontSize: 18,
    textDecorationColor: "black",
    fontWeight: "normal",
    alignSelf: "flex-end",
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
  color: string;
  titleLeft: string;
  logoLeft?: string;
  titleRight: string;
  patientName: string;
  patientDOB: string;
  subject: string;
  content?: Record<string, any>;
  officeFields?: Record<string, any>;
  ownerFields?: Record<string, any>;
}

const MyComponent: React.FC<MyComponentProps> = ({ color, titleLeft, logoLeft, titleRight, ownerFields }) => {
  const logoLeftExtension = getFileExtension();
  /*
  if (logoLeft && logoLeftExtension === "svg") {
    console.log("logoLeft", logoLeft, typeof logoLeft);
    const svgDataURI = await svgToDataUri(logoLeft);
    console.log("svgDataURI", svgDataURI);
  }
  */

  return (
    <View style={{ width: "100%" }}>
      <View style={[styles.container, { paddingTop: 0, paddingHorizontal: 2, paddingBottom: 2 }]}>
        {logoLeft ? (
          <View debug={false} style={styles.logoContainer}>
            <Image src={logoLeft} style={styles.logoLeft} />
            {/*<Image src={{ uri: logoLeft, method: "GET", headers: { "Cache-Control": "no-cache" }, body: "" }} />*/}
          </View>
        ) : (
          <Text style={styles.titleLeft}>{titleLeft}</Text>
        )}
        <Text style={styles.titleRight}>{titleRight}</Text>
      </View>
      <Svg width="100%" height="5" viewBox="0 0 1000 5">
        <Rect x="0" y="0" rx={0} ry={0} width="100%" height="5" fill={hexToRgb(color ?? "#3A2CAD")} />
      </Svg>
    </View>
  );
};

export default MyComponent;
