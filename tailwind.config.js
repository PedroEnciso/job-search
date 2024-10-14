module.exports = {
  content: ["./src/views/*.pug", "./src/views/*/*.pug"],
  separator: "__",
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
  daisyui: {
    themes: [
      "pastel",
      {
        wise: {
          // custom - lime green
          primary: "#9fe870",
          // custom - dark green
          "primary-content": "#163300",
          // custom - dark green
          secondary: "#163300",
          // custom - lime green
          "secondary-content": "#9fe870",
          // custom - light blue
          accent: "#a0e1e1",
          // custom - dark grey
          "accent-content": "#21231d",
          // custom - light gray, idk what for
          neutral: "#e8ebe6",
          // default
          "neutral-content": "#c6dbff",
          // custom
          "base-100": "#ffffff",
          // custom - very light grey
          "base-200": "#16330014",
          // lighter-grey, secondary text
          "base-300": "#454745",
          // custom
          "base-content": "#0e0f0c",
          // default
          info: "#0000ff",
          // default
          "info-content": "#c6dbff",
          // default
          success: "#00ff00",
          // default
          "success-content": "#001600",
          // default
          warning: "#00ff00",
          // default
          "warning-content": "#001600",
          // default
          error: "#ff0000",
          // default
          "error-content": "#160000",
        },
      },
    ],
  },
  theme: {
    width: (theme) => ({
      auto: "auto",
      ...theme("spacing"),
      "1_2": "50%",
      "1_3": "33.333333%",
      "2_3": "66.666667%",
      "1_4": "25%",
      "2_4": "50%",
      "3_4": "75%",
      "1_5": "20%",
      "2_5": "40%",
      "3_5": "60%",
      "4_5": "80%",
      "1_6": "16.666667%",
      "2_6": "33.333333%",
      "3_6": "50%",
      "4_6": "66.666667%",
      "5_6": "83.333333%",
      "1_12": "8.333333%",
      "2_12": "16.666667%",
      "3_12": "25%",
      "4_12": "33.333333%",
      "5_12": "41.666667%",
      "6_12": "50%",
      "7_12": "58.333333%",
      "8_12": "66.666667%",
      "9_12": "75%",
      "10_12": "83.333333%",
      "11_12": "91.666667%",
      full: "100%",
      screen: "100vw",
    }),
  },
};
