"use client";

import React from "react";
import { Link, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Field } from '../../types/formGenerator';

const styles = StyleSheet.create({
  container: {
    alignItems: "stretch",
    paddingBottom: 5,
    paddingHorizontal: 15,
    paddingTop: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
    borderBottomStyle: "solid",
  },
  detailColumn: {
    paddingVertical: 6,
    flexDirection: "column",
    alignSelf: "flex-end",
    justifySelf: "flex-end",
    flexGrow: 9,
  },
  linkColumn: {
    flexDirection: "column",
    flexGrow: 2,
    alignSelf: "flex-end",
    justifySelf: "flex-end",
  },
  title: {
    fontSize: 12,
    paddingBottom: 0,
    alignSelf: "flex-start",
    fontWeight: "bold",
  },
  textLeftCol: {
    fontSize: 10,
    alignSelf: "flex-start",
    justifySelf: "flex-start",
  },
  textRightCol: {
    fontSize: 10,
    flexDirection: "column",
    alignSelf: "flex-end",
    justifySelf: "flex-start",

    flexGrow: 9,
  },
  link: {
    fontSize: 10,
    color: "black",
    textDecoration: "none",
    alignSelf: "flex-end",
    justifySelf: "flex-end",
  },
});

interface MyComponentProps {
  title?: string;
  content: string;
  id?: string;
  settings?: Field;
}

const ReportSection: React.FC<MyComponentProps> = ({ title, content, id, settings }) => {
  if (settings?.exportExcluded) return null;
  return (
    <View style={styles.container} key={id} id={id + "_id"}>
      {!settings?.exportHideLabel && <Text style={styles.title}>{title ?? ""}</Text>}
      <Text style={styles.textLeftCol}>{content ?? ""}</Text>
    </View>
  );
};

export default ReportSection;
