import { toast } from "@common/components/ui/sonner";

import { resIsSuccess } from '../utils/httpStatus';
import { ObjectHasPath } from '../utils/objectManipulation';
import axios from "axios";

// Function to get most recent form values
export const getMostRecentFormValues = async (payload: Record<string, any>, desiredFields: string[]) => {
  // Your logic to retrieve form values
  try {
    console.log("payload99", payload);
    //get a new form, gets the ID and sets ownerId to be current user.
    const res = await axios.post("/api/getMostRecentFormValues", payload);
    if (resIsSuccess(res)) {
      console.log("resMOSTRECENT", res);
      if (ObjectHasPath(res, ["data", "data", "fields"]) && Object.keys(res.data.data.fields).length !== 0) {
        toast({
          title: "Autofilling field values",
          message: "Found relevant patient records from their most recent form",
          type: "default",
        });

        return res.data.data.fields;
      } else {
        toast({
          title: "No relevant previous records.",
          message: "Did not find relevant patient records from their most recent form",
          type: "default",
        });
      }
      return;
    } else {
      throw new Error("Error reading historical forms");
    }
  } catch (error: any) {
    toast({
      title: "Error reading historical forms",
      message: JSON.stringify(error),
      type: "error",
    });
  }
  return;
};
