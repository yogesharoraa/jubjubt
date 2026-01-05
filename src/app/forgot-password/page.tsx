import { Suspense } from "react";
import ForgotPasswordClient from "./ForgotPasswordClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <ForgotPasswordClient />
    </Suspense>
  );
}
