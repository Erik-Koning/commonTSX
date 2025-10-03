import { resIsSuccess } from "../../utils/httpStatus";
import axios from "axios";
import jwt, { JwtPayload } from "jsonwebtoken";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Switch } from "./switch";
import { toast } from "@common/components/ui/sonner";
import { Loader2 } from "lucide-react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import RevealHidden from "./RevealHidden";
import { CopyToClipboardWrapper } from "./CopyToClipboardWrapper";
import { InputArray } from "./InputArray";
import { cn } from "../../lib/utils";

interface ChangeTwoFAProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  containerClassName?: string;
  token?: string;
  onSuccessfulVerify?: () => void;
  defaultChecked?: boolean;
  setPassword?: (data: { currentPassword: string; newPassword: string; newPasswordHashed: string | undefined }) => any;
  onConfirmDisable2FA?: () => void;
}

export const ChangeTwoFA = forwardRef<HTMLDivElement, ChangeTwoFAProps>(
  ({ className, containerClassName, token, onSuccessfulVerify, defaultChecked, setPassword, onConfirmDisable2FA, ...props }, ref) => {
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [twoFAEnabled, setTwoFAEnabled] = useState<boolean>(defaultChecked !== undefined ? defaultChecked : false);
    const [checked, setChecked] = useState(defaultChecked !== undefined ? defaultChecked : false);
    const [email, setEmail] = useState("");
    const [isTokenExpired, setIsTokenExpired] = useState(false);
    const [OTP, setOTP] = useState("");
    const inputsRef = useRef<HTMLInputElement[]>([]);
    const [isInputVisible, setIsInputVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);
    const [isQRLoading, setIsQRLoading] = useState(true);
    const [dataURL, setDataURL] = useState("");
    const [secretKey, setSecretKey] = useState("");

    const twoFACodeLength = 6;

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting, isSubmitted },
      setError,
    } = useForm();

    const onSubmit = async (data: Record<string, any>) => {
      if (data.newPassword !== data.confirmNewPassword) {
        console.log("Passwords do not match");
        setError("confirmNewPassword", { type: "custom", message: "Passwords do not match" });
        return;
      }
      await setPassword?.({ currentPassword: data.currentPassword, newPassword: data.newPassword, newPasswordHashed: undefined });
    };

    useEffect(() => {
      if (defaultChecked !== undefined) {
        setTwoFAEnabled(defaultChecked);
        setChecked(defaultChecked);
      }
    }, [defaultChecked]);

    const handleSwitchChange = async (checked: boolean) => {
      if (checked) {
        setChecked(checked);
        setShow2FASetup(checked);
      } else if (!checked) {
        //confirm user wants to disable 2fa via a modal with auth code
        if (!twoFAEnabled) {
          setChecked(checked);
          setShow2FASetup(checked);
          return;
        }

        onConfirmDisable2FA?.();

        /*
      setTwoFAEnabled(false);
      if (twoFAEnabled) {
        const success = await postTwoFAEnabled(false);
        if (!success) {
          //revert the setting
          setTwoFAEnabled(true);
        }
      }
      */
      }
    };

    // Runs when token is set or changes - first render
    // purpose of this effect is to get the QR code and secret key
    useEffect(() => {
      ////console.log("token", token);
      if (!show2FASetup && (!token || token === "" || token === "undefined" || token === "null")) {
        //router.push("/try");
        ////console.log("returning");
        return;
      } else {
        //show2FASetup is true
        if (!token || token === "" || token === "undefined" || token === "null") {
          token = undefined;
        }
      }

      try {
        if (token) {
          // Verify and decode the JWT token
          const decodedJWT = jwt.decode(
            token
            //String(process.env.JWT_SECRET)
          ) as JwtPayload;

          // Extract the expiration time from the decoded token
          const expirationTime = decodedJWT.exp;

          // Get the email from the decoded token
          setEmail(decodedJWT.iss ? decodedJWT.iss.toLowerCase() : "");

          // Get the current UNIX timestamp
          const currentTime = Math.floor(Date.now() / 1000);

          ////console.log("expirationTime", expirationTime);
          ////console.log("currentTime", currentTime);
          // Compare the current time with the expiration time
          if (expirationTime && expirationTime < currentTime) {
            ////console.log("JWT token has expired");
            setIsTokenExpired(true);
            toast({
              title: "Error",
              message: "JWT Token is expired",
              type: "error",
            });
            return;
          } else {
          }
        }

        axios.post("/api/generateQRCodeOTPURL", { token }).then((res) => {
          if (resIsSuccess(res) && res.data.data) {
            ////console.log("QR code generated", res.data.secret);
            setDataURL(res.data.data);
            setSecretKey(res.data.secret.base32);
            setIsQRLoading(false);
          } else {
            toast({
              title: "Error",
              message: "Error generating QR code",
              type: "error",
            });
          }
        });
      } catch (error: any) {
        //////console.log("error --", error.response.data.message);
        toast({
          title: "Error",
          message: "Error verifying token.",
          type: "error",
        });
      }
      setIsLoading(false);
    }, [token, show2FASetup]);

    //on token change effect, also runs on first load becuse token is set on  first load effect
    useEffect(() => {
      //user has input all digits, verify token
      if (OTP && OTP.length === twoFACodeLength) {
        console.log("OTPEFFECT", OTP);
        setIsLoading(true);
        (async () => {
          try {
            ////check if OTP is valid and on success will set user data to show they are enrolled in 2fa
            const enrollUser2FA = true;
            const res = await axios.post("/api/verify2FA", { token: OTP, email, enrollUser2FA });
            console.log("res", res);
            if (resIsSuccess(res)) {
              console.log("success");
              onSuccessfulVerify && onSuccessfulVerify();
              setShow2FASetup(false);
              setTwoFAEnabled(true);
            } else {
              throw new Error("Error verifying token");
            }
          } catch (error: any) {
            toast({
              title: "Error",
              message: error.response.data.message,
              type: "error",
            });
          } finally {
            setIsLoading(false);
          }
          return;
        })(); // Call the async arrow function immediately
      } else {
        //user has not input all digits, do nothing
      }
    }, [OTP]);

    const handleInputArrayChange = (value: string) => {
      console.log("InputArray", value);
      setOTP(value);
    };

    console.log("twoFAEnabled", twoFAEnabled);

    return (
      <div {...props} className={cn("flex flex-col gap-y-2", className)}>
        <div className={cn("flex flex-row items-center gap-6", containerClassName)}>
          <Switch id="enableTwoFA" variant="purple" onCheckedChange={handleSwitchChange} checked={checked} defaultChecked={twoFAEnabled} />
          {!show2FASetup && twoFAEnabled && (
            <div className="flex w-fit items-center gap-x-2 rounded-md border border-border p-2.5 shadow-md">
              <h1>Two-factor Authentication Enabled</h1>
              <LockOutlinedIcon className="text-green" sx={{ fontSize: 24 }} />
            </div>
          )}
          {!show2FASetup && !twoFAEnabled && (
            <div className="flex w-fit items-center gap-x-2 rounded-md border border-border p-2.5 shadow-md">
              <h1>Two-factor Authentication Disabled</h1>
              <LockOpenOutlinedIcon className="text-tertiary-dark" sx={{ fontSize: 24 }} />
            </div>
          )}
        </div>
        <div className="flex flex-[3] flex-col gap-4 2xl:flex-row">
          {show2FASetup && (
            <div className="mx-auto w-full max-w-[750px] rounded-md border bg-background-light p-8 px-6 text-black dark:text-white xl:w-[1000px] ">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="pb-2">
                  <h1 className="text-xl font-extrabold text-black dark:text-white">Steps to further secure your account via one-time password&apos;s.</h1>
                  <p className="mt-2 pb-8 font-bold">Highly recommended for all users.</p>
                  <h1 className="text-md text-black dark:text-white">
                    1. Download an authenticator app such as Google Authenticator or Authy to your mobile device.
                  </h1>
                  <h1 className="text-md text-black dark:text-white">2. Scan the QR code here with your authenticator app.</h1>
                  <h1 className="text-md text-black dark:text-white">3. Enter the 6-digit code from your authenticator app below.</h1>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="w-auto items-center justify-center rounded-md p-2 shadow">{!isQRLoading && <img src={dataURL} alt="QR Code" />}</div>
                  {isQRLoading && (
                    <div className="animate-pulse justify-center align-middle">
                      <Loader2 className="animate-spin" size={36} />
                    </div>
                  )}
                  <div className="flex justify-center">
                    {secretKey.length > 0 && (
                      <RevealHidden
                        hiddenTitle="Show one-time-password setup key"
                        visibleTitle={secretKey}
                        titleClassName="text-[11px]"
                        buttonclassName="mt-1 text-[6px]"
                      >
                        <CopyToClipboardWrapper dataToCopy={secretKey} className="flex items-center justify-center"></CopyToClipboardWrapper>
                      </RevealHidden>
                    )}
                  </div>
                </div>
              </div>
              {!isLoading && !isTokenExpired && (
                <div className="mx-auto flex w-full flex-col justify-between rounded-md py-4 sm:px-0 ">
                  <InputArray title={"Verify your generated code to confirm activation"} length={twoFACodeLength} onChange={handleInputArrayChange} />
                  <div className="md: flex items-end justify-end pt-12"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ChangeTwoFA.displayName = "ChangeTwoFA";
