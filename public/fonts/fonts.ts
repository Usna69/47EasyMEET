import localFont from "next/font/local";

export const poppins = localFont({
  src: [
    {
      path: "./Poppins/Poppins-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "./Poppins/Poppins-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./Poppins/Poppins-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./Poppins/Poppins-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./Poppins/Poppins-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Poppins/Poppins-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "./Poppins/Poppins-Thin.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./Poppins/Poppins-ExtraLight.ttf",
      weight: "100",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
});
