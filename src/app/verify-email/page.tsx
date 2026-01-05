import { Suspense } from "react";
import VerifyEmail from "./VerifyEmail";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <VerifyEmail />
    </Suspense>
  );
}
