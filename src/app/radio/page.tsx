"use client";
export default function RadioPage() {
  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
}
const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body {
          background: #000;
          color: #fff;
          margin: 0;
          padding: 0;
        }
      </style>
      <script src="/radio/dist/splayer.min.js"></script>
      <link rel="stylesheet" href="/radio/dist/splayer.ui.min.css" />
    </head>
    <body>
      <h1>Hello from index.html</h1>
      <script>
        console.log("Index HTML JS running");
      </script>
    </body>
  </html>
`;