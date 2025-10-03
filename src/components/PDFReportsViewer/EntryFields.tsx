import camelOrSnakeToTitleCase from '../../utils/camelOrSnakeToTitleCase';
import { objHasKey } from '../../utils/objectManipulation';
import { splitOnString } from '../../utils/stringManipulation';
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  container: {
    alignItems: "stretch",
    paddingBottom: 5,
    paddingLeft: 20,
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
    paddingBottom: 2,
    alignSelf: "flex-start",
    fontWeight: "bold",
  },
  subtitle: {
    paddingBottom: 0,
    alignSelf: "flex-start",
    fontWeight: "semibold",
  },
  EntryTitle: {
    paddingBottom: 0,
    alignSelf: "flex-start",
    fontWeight: "semibold",
  },
  EntryValue: {
    paddingBottom: 0,
    alignSelf: "flex-start",
  },
  row: {
    marginVertical: 2,
    flexDirection: "row",
  },
  textLeftCol: {
    alignSelf: "flex-start",
    justifySelf: "flex-start",
  },
  textRightCol: {
    flexDirection: "column",
    alignSelf: "flex-end",
    justifySelf: "flex-start",

    flexGrow: 9,
  },
});

interface MyComponentProps {
  title?: string;
  content: { [key: string]: Record<string, any> };
  hiddenFields?: any;
}

const EntryFields: React.FC<MyComponentProps> = ({ title, content, hiddenFields }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{`${title || ""}`}</Text>
      {Object.entries(content).map(([section, sectionFields]) => {
        return (
          <View key={section}>
            <Text style={styles.subtitle}>{`${camelOrSnakeToTitleCase(section) || ""}`}</Text>
            {Object.entries(sectionFields).map(([entryTitle, value]) => {
              const fieldName = `${section}_${entryTitle}`;
              if (
                hiddenFields &&
                objHasKey(
                  (hiddenFields as string[]).map((entryKey) => {
                    // Call your modification function here
                    return splitOnString(entryKey, "_");
                  }),
                  splitOnString(fieldName, "_")
                )
              ) {
                return null;
              }
              // Check if value is an object and has a value property
              if (typeof value === "object" && value.value !== undefined && value.value !== null) {
                value = String(value.value);
              } else {
                value = String(value);
              }

              // Determine flex direction based on value length
              const flexDirection: "column" | "row" = value.length > 20 ? "column" : "row";

              return (
                <View key={entryTitle} style={[styles.row, { flexDirection: flexDirection }]}>
                  <View>
                    <Text style={styles.EntryTitle}>{`${camelOrSnakeToTitleCase(entryTitle)}: `}</Text>
                  </View>
                  <View>
                    <Text style={styles.EntryValue}>{value}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

export default EntryFields;
