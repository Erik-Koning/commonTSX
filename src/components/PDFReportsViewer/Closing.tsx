import React from "react";
import { Link, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingBottom: 5,
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
  content: string;
}

const Closing: React.FC<MyComponentProps> = ({ content }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.textLeftCol}>{`${content}`}</Text>
    </View>
  );
};

export default Closing;
