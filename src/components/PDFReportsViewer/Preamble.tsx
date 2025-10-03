import React from "react";
import { Link, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingBottom: 5,
    paddingTop: 5,
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
  content: string;
}

const Preamble: React.FC<MyComponentProps> = ({ content }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.textLeftCol}>{`${content}`}</Text>
    </View>
  );
};

export default Preamble;
