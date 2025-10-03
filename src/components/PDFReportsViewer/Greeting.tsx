import React from "react";
import { Link, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingBottom: 5,
    paddingTop: 30,
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
    paddingBottom: 20,
    alignSelf: "flex-end",
    justifyContent: "space-around",
    fontSize: 18,
  },
  textLeftCol: {
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
  fullName?: string;
  prefix?: string;
  firstName?: string;
  lastName?: string;
}

const Greeting: React.FC<MyComponentProps> = ({ fullName, prefix, firstName, lastName }) => {
  console.log("Greeting", prefix, firstName, lastName);
  let greeting = "";
  let completeName = "";
  if (!fullName) {
    if (!firstName && !lastName) {
      completeName = "who it may concern";
    } else {
      completeName = `${firstName || ""} ${lastName || ""}`;
    }
  } else {
    completeName = fullName;
  }
  if (prefix) {
    completeName = `${prefix} ${completeName},`;
  }

  greeting = `Dear ${completeName},`;

  return (
    <View style={styles.container}>
      <Text style={styles.textLeftCol}>{`${greeting}`}</Text>
    </View>
  );
};

export default Greeting;
