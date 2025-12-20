import { ImageResponse } from "next/og";
import * as React from "react";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 30% 30%, #0f1626 0, #060910 55%, #02040b 100%)",
          color: "#f5f7fb",
          fontSize: 200,
          fontWeight: 800,
          letterSpacing: -6,
          borderRadius: 96,
        },
      },
      "SW",
    ),
    {
      width: 512,
      height: 512,
    },
  );
}
